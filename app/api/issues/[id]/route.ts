import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateIssueSchema } from "@/lib/validations/issue";
import { calculateUrgencyScore } from "@/lib/urgency";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

// GET /api/issues/[id] - Get single issue with full details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const issue = await prisma.issue.findUnique({
      where: { id: params.id },
      include: {
        location: {
          include: {
            parent: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        photos: {
          orderBy: { createdAt: "asc" },
        },
        assignments: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            assignedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { assignedAt: "desc" },
        },
        statusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        votes: {
          where: { userId: session.user.id },
          take: 1,
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isStaffOrAdmin = user?.role === "STAFF" || user?.role === "ADMIN";
    const isReporter = issue.reporterId === session.user.id;

    if (!isStaffOrAdmin && !isReporter && issue.isAnonymous) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error("Get issue error:", error);
    return NextResponse.json(
      { error: "Failed to fetch issue" },
      { status: 500 },
    );
  }
}

// PATCH /api/issues/[id] - Update issue
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateIssueSchema.parse(body);

    // Check if issue exists
    const existingIssue = await prisma.issue.findUnique({
      where: { id: params.id },
      include: {
        photos: true,
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!existingIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isStaffOrAdmin = user?.role === "STAFF" || user?.role === "ADMIN";
    const isReporter = existingIssue.reporterId === session.user.id;

    // Only reporter can edit basic details, staff/admin can edit everything
    if (!isStaffOrAdmin && (!isReporter || validatedData.status || validatedData.priority)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Recalculate urgency if priority changes
    let urgencyScore = existingIssue.urgencyScore;
    if (validatedData.priority && validatedData.priority !== existingIssue.priority) {
      const ageInHours = Math.floor(
        (Date.now() - existingIssue.createdAt.getTime()) / (1000 * 60 * 60),
      );
      urgencyScore = calculateUrgencyScore({
        category: existingIssue.category,
        priority: validatedData.priority,
        voteCount: existingIssue._count.votes,
        escalationLevel: existingIssue.escalationLevel,
        ageInHours,
        description: existingIssue.description,
        photoCount: existingIssue.photos.length,
      });
    }

    // Update issue and create status history if status changes
    const issue = await prisma.$transaction(async (tx) => {
      const updated = await tx.issue.update({
        where: { id: params.id },
        data: {
          ...validatedData,
          urgencyScore,
        },
        include: {
          location: true,
          reporter: {
            select: {
              id: true,
              name: true,
              role: true,
              email: true,
            },
          },
          photos: true,
          assignments: {
            include: {
              staff: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Create status history if status changed
      if (validatedData.status && validatedData.status !== existingIssue.status) {
        await tx.statusHistory.create({
          data: {
            issueId: params.id,
            fromStatus: existingIssue.status,
            toStatus: validatedData.status,
            changedById: session.user.id,
          },
        });

        // Notify reporter if status changed
        if (existingIssue.reporterId) {
          await tx.notification.create({
            data: {
              userId: existingIssue.reporterId,
              issueId: params.id,
              type: "STATUS_CHANGE",
              message: `Issue status updated to ${validatedData.status}`,
            },
          });
        }
      }

      return updated;
    });

    if (validatedData.status && validatedData.status !== existingIssue.status) {
      const reporterEmail = issue.reporter?.email;
      if (reporterEmail) {
        await sendEmail({
          to: reporterEmail,
          subject: `Issue status updated: ${validatedData.status}`,
          html: `<p>Your reported issue status is now <strong>${validatedData.status}</strong>.</p>`,
          text: `Your reported issue status is now ${validatedData.status}.`,
        });
      }
    }

    return NextResponse.json({ issue });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Update issue error:", error);
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 500 },
    );
  }
}

// DELETE /api/issues/[id] - Delete issue (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.issue.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete issue error:", error);
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 },
    );
  }
}

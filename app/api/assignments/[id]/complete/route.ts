import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { completeAssignmentSchema } from "@/lib/validations/assignment";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

// POST /api/assignments/[id]/complete - Mark assignment as complete with proof
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = completeAssignmentSchema.parse(body);

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        issue: {
          include: {
            reporter: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 },
      );
    }

    // Only assigned staff can complete it
    if (assignment.staffId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (assignment.completedAt) {
      return NextResponse.json(
        { error: "Assignment already completed" },
        { status: 400 },
      );
    }

    // Complete assignment, update issue, add completion photo
    const updated = await prisma.$transaction(async (tx) => {
      // Update assignment
      const completedAssignment = await tx.assignment.update({
        where: { id: params.id },
        data: {
          completedAt: new Date(),
          completionNote: validatedData.completionNote,
          completionPhotoUrl: validatedData.completionPhotoUrl,
        },
        include: {
          issue: {
            include: {
              location: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update issue to resolved
      await tx.issue.update({
        where: { id: assignment.issueId },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
        },
      });

      // Add after photo
      await tx.issuePhoto.create({
        data: {
          issueId: assignment.issueId,
          url: validatedData.completionPhotoUrl,
          kind: "AFTER",
        },
      });

      // Create status history
      await tx.statusHistory.create({
        data: {
          issueId: assignment.issueId,
          fromStatus: assignment.issue.status,
          toStatus: "RESOLVED",
          changedById: session.user.id,
          note: validatedData.completionNote,
        },
      });

      // Notify reporter
      if (assignment.issue.reporterId) {
        await tx.notification.create({
          data: {
            userId: assignment.issue.reporterId,
            issueId: assignment.issueId,
            type: "STATUS_CHANGE",
            message: `Your reported issue has been resolved! Check the completion photo.`,
          },
        });
      }

      // Update staff reputation score
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          reputationScore: {
            increment: 10, // Reward for completing tasks
          },
        },
      });

      return completedAssignment;
    });

    const reporterEmail = assignment.issue.reporter?.email;
    if (reporterEmail) {
      await sendEmail({
        to: reporterEmail,
        subject: "Your issue has been resolved",
        html: `<p>Your reported issue has been resolved. Please review the completion photo in the app.</p>`,
        text: "Your reported issue has been resolved. Please review the completion photo in the app.",
      });
    }

    return NextResponse.json({ assignment: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Complete assignment error:", error);
    return NextResponse.json(
      { error: "Failed to complete assignment" },
      { status: 500 },
    );
  }
}

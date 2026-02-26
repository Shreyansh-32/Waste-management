import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAssignmentSchema } from "@/lib/validations/assignment";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

// POST /api/assignments - Create new assignment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Only STAFF and ADMIN can create assignments
    if (user?.role !== "STAFF" && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createAssignmentSchema.parse(body);

    // Verify issue exists and is not already resolved
    const issue = await prisma.issue.findUnique({
      where: { id: validatedData.issueId },
      include: {
        reporter: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    if (issue.status === "RESOLVED") {
      return NextResponse.json(
        { error: "Cannot assign resolved issue" },
        { status: 400 },
      );
    }

    // Verify staff member exists and has appropriate role
    const staffMember = await prisma.user.findUnique({
      where: { id: validatedData.staffId },
      select: { role: true, name: true, email: true },
    });

    if (!staffMember || staffMember.role !== "STAFF") {
      return NextResponse.json(
        { error: "Invalid staff member" },
        { status: 400 },
      );
    }

    // Create assignment and update issue status
    const assignment = await prisma.$transaction(async (tx) => {
      const newAssignment = await tx.assignment.create({
        data: {
          issueId: validatedData.issueId,
          staffId: validatedData.staffId,
          assignedById: session.user.id,
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
      });

      // Update issue status to ASSIGNED
      await tx.issue.update({
        where: { id: validatedData.issueId },
        data: { status: "ASSIGNED" },
      });

      // Create status history
      await tx.statusHistory.create({
        data: {
          issueId: validatedData.issueId,
          fromStatus: issue.status,
          toStatus: "ASSIGNED",
          changedById: session.user.id,
          note: `Assigned to ${staffMember.name}`,
        },
      });

      // Notify assigned staff member
      await tx.notification.create({
        data: {
          userId: validatedData.staffId,
          issueId: validatedData.issueId,
          type: "ASSIGNMENT",
          message: `New task assigned: ${issue.title || issue.description.slice(0, 50)}`,
        },
      });

      // Notify reporter if not anonymous
      if (issue.reporterId) {
        await tx.notification.create({
          data: {
            userId: issue.reporterId,
            issueId: validatedData.issueId,
            type: "STATUS_CHANGE",
            message: `Your reported issue has been assigned to staff`,
          },
        });
      }

      return newAssignment;
    });

    const staffEmail = staffMember.email;
    if (staffEmail) {
      await sendEmail({
        to: staffEmail,
        subject: "New assignment received",
        html: `<p>You have a new task assigned: <strong>${issue.title || issue.description.slice(0, 60)}</strong>.</p>`,
        text: `You have a new task assigned: ${issue.title || issue.description.slice(0, 60)}.`,
      });
    }

    const reporterEmail = issue.reporter?.email;
    if (reporterEmail) {
      await sendEmail({
        to: reporterEmail,
        subject: "Your issue has been assigned",
        html: `<p>Your reported issue has been assigned to staff and is now being handled.</p>`,
        text: "Your reported issue has been assigned to staff and is now being handled.",
      });
    }

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Create assignment error:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 },
    );
  }
}

// GET /api/assignments - Get assignments
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status"); // active, completed

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Build where clause
    const where: any = {};

    // Staff can only see their own assignments
    if (user?.role === "STAFF") {
      where.staffId = session.user.id;
    } else if (staffId) {
      // Admin can filter by specific staff
      where.staffId = staffId;
    }

    if (status === "active") {
      where.completedAt = null;
    } else if (status === "completed") {
      where.completedAt = { not: null };
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        issue: {
          include: {
            location: true,
            photos: {
              where: { kind: "BEFORE" },
              take: 1,
            },
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
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
      orderBy: [
        { completedAt: "asc" }, // Incomplete first
        { issue: { urgencyScore: "desc" } }, // Then by urgency
      ],
      take: 50,
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Get assignments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}

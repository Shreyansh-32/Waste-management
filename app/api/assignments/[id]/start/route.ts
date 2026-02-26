import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { completeAssignmentSchema } from "@/lib/validations/assignment";
import { z } from "zod";

// POST /api/assignments/[id]/start - Mark assignment as started
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        issue: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 },
      );
    }

    // Only assigned staff can start it
    if (assignment.staffId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (assignment.startedAt) {
      return NextResponse.json(
        { error: "Assignment already started" },
        { status: 400 },
      );
    }

    // Update assignment and issue status
    const updated = await prisma.$transaction(async (tx) => {
      const updatedAssignment = await tx.assignment.update({
        where: { id: params.id },
        data: { startedAt: new Date() },
      });

      await tx.issue.update({
        where: { id: assignment.issueId },
        data: { status: "IN_PROGRESS" },
      });

      await tx.statusHistory.create({
        data: {
          issueId: assignment.issueId,
          fromStatus: assignment.issue.status,
          toStatus: "IN_PROGRESS",
          changedById: session.user.id,
          note: "Work started",
        },
      });

      return updatedAssignment;
    });

    return NextResponse.json({ assignment: updated });
  } catch (error) {
    console.error("Start assignment error:", error);
    return NextResponse.json(
      { error: "Failed to start assignment" },
      { status: 500 },
    );
  }
}

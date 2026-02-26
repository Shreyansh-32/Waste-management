import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const assignments = await prisma.assignment.findMany({
    where: { staffId: userId, completedAt: null },
    orderBy: { assignedAt: "desc" },
    include: {
      issue: {
        include: {
          location: { select: { name: true, type: true } },
          photos: { where: { kind: "BEFORE" }, take: 1 },
        },
      },
      assignedBy: { select: { name: true } },
    },
  });

  return NextResponse.json({ assignments });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { assignmentId, action, completionNote } = await request.json();
  const userId = (session.user as { id: string }).id;

  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, staffId: userId },
  });

  if (!assignment) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (action === "start") {
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { startedAt: new Date() },
    });
    await prisma.issue.update({
      where: { id: assignment.issueId },
      data: { status: "IN_PROGRESS" },
    });
  } else if (action === "complete") {
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { completedAt: new Date(), completionNote },
    });
    await prisma.issue.update({
      where: { id: assignment.issueId },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
    await prisma.statusHistory.create({
      data: {
        issueId: assignment.issueId,
        toStatus: "RESOLVED",
        changedById: userId,
        note: completionNote,
      },
    });
  }

  return NextResponse.json({ success: true });
}

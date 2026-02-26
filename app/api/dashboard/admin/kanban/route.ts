import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [issues, staffList] = await Promise.all([
    prisma.issue.findMany({
      where: { status: { not: "RESOLVED" } },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      include: {
        location: { select: { name: true, type: true } },
        reporter: { select: { name: true } },
        assignments: {
          where: { completedAt: null },
          include: { staff: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const columns = {
    PENDING:     issues.filter((i) => i.status === "PENDING"),
    ASSIGNED:    issues.filter((i) => i.status === "ASSIGNED"),
    IN_PROGRESS: issues.filter((i) => i.status === "IN_PROGRESS"),
    REJECTED:    issues.filter((i) => i.status === "REJECTED"),
  };

  return NextResponse.json({ columns, staffList });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { issueId, staffId, newStatus } = await request.json();
  const adminId = (session.user as { id: string }).id;

  if (staffId) {
    await prisma.assignment.create({
      data: {
        issueId,
        staffId,
        assignedById: adminId,
      },
    });
  }

  const issue = await prisma.issue.update({
    where: { id: issueId },
    data: { status: newStatus ?? "ASSIGNED" },
  });

  await prisma.statusHistory.create({
    data: {
      issueId,
      fromStatus: issue.status,
      toStatus: newStatus ?? "ASSIGNED",
      changedById: adminId,
    },
  });

  return NextResponse.json({ success: true });
}

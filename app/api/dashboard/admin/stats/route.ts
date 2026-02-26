import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [
    totalIssues,
    pendingIssues,
    resolvedIssues,
    inProgressIssues,
    totalStaff,
    recentIssues,
  ] = await Promise.all([
    prisma.issue.count(),
    prisma.issue.count({ where: { status: "PENDING" } }),
    prisma.issue.count({ where: { status: "RESOLVED" } }),
    prisma.issue.count({ where: { status: "IN_PROGRESS" } }),
    prisma.user.count({ where: { role: "STAFF", isActive: true } }),
    prisma.issue.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        location: { select: { name: true } },
        reporter: { select: { name: true } },
      },
    }),
  ]);

  const resolutionRate = totalIssues > 0
    ? Math.round((resolvedIssues / totalIssues) * 100)
    : 0;

  return NextResponse.json({
    totalIssues,
    pendingIssues,
    resolvedIssues,
    inProgressIssues,
    totalStaff,
    resolutionRate,
    recentIssues,
  });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const staffList = await prisma.user.findMany({
    where: { role: "STAFF", isActive: true },
    include: {
      assignments: {
        include: {
          issue: { select: { status: true, priority: true } },
        },
      },
    },
  });

  const performance = staffList.map((staff) => {
    const total = staff.assignments.length;
    const completed = staff.assignments.filter((a) => a.completedAt !== null).length;
    const active = staff.assignments.filter((a) => a.completedAt === null && a.startedAt !== null).length;

    const completedAssignments = staff.assignments.filter(
      (a) => a.completedAt !== null && a.startedAt !== null
    );

    const avgResolutionMs = completedAssignments.length > 0
      ? completedAssignments.reduce((sum, a) => {
          return sum + (a.completedAt!.getTime() - a.startedAt!.getTime());
        }, 0) / completedAssignments.length
      : 0;

    const avgResolutionHours = Math.round(avgResolutionMs / 3_600_000);
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      reputationScore: staff.reputationScore,
      totalAssigned: total,
      completed,
      active,
      completionRate,
      avgResolutionHours,
    };
  });

  performance.sort((a, b) => b.completionRate - a.completionRate);

  return NextResponse.json({ performance });
}

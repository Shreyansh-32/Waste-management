import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const locations = await prisma.location.findMany({
    include: {
      _count: { select: { issues: true } },
      issues: {
        select: { status: true, priority: true, category: true },
      },
    },
    orderBy: { issues: { _count: "desc" } },
  });

  const heatmapData = locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    type: loc.type,
    issueCount: loc._count.issues,
    pendingCount: loc.issues.filter((i) => i.status === "PENDING").length,
    resolvedCount: loc.issues.filter((i) => i.status === "RESOLVED").length,
    criticalCount: loc.issues.filter((i) => i.priority === "CRITICAL").length,
    topCategory: loc.issues.length > 0
      ? Object.entries(
          loc.issues.reduce((acc: Record<string, number>, i) => {
            acc[i.category] = (acc[i.category] ?? 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0]?.[0]
      : null,
  }));

  return NextResponse.json({ heatmapData });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Find locations with 3+ unresolved issues — recommend cleaning
  const hotspots = await prisma.location.findMany({
    where: {
      issues: {
        some: { status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] } },
      },
    },
    include: {
      issues: {
        where: { status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] } },
        select: { priority: true, category: true, createdAt: true, urgencyScore: true },
      },
    },
  });

  const recommendations = hotspots
    .map((loc) => {
      const criticalCount = loc.issues.filter((i) => i.priority === "CRITICAL").length;
      const highCount = loc.issues.filter((i) => i.priority === "HIGH").length;
      const avgUrgency = loc.issues.reduce((s, i) => s + i.urgencyScore, 0) / (loc.issues.length || 1);
      const oldestIssue = loc.issues.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
      const daysSinceOldest = oldestIssue
        ? Math.floor((Date.now() - oldestIssue.createdAt.getTime()) / 86_400_000)
        : 0;

      const score = criticalCount * 40 + highCount * 20 + avgUrgency * 5 + daysSinceOldest * 2;

      const categories = Object.entries(
        loc.issues.reduce((acc: Record<string, number>, i) => {
          acc[i.category] = (acc[i.category] ?? 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1]);

      return {
        locationId: loc.id,
        locationName: loc.name,
        locationType: loc.type,
        totalIssues: loc.issues.length,
        criticalCount,
        highCount,
        score: Math.round(score),
        topCategory: categories[0]?.[0] ?? "OTHER",
        daysSinceOldest,
        recommendation: criticalCount > 0
          ? "Immediate deep clean required"
          : highCount > 2
          ? "Urgent cleaning scheduled needed"
          : daysSinceOldest > 7
          ? "Overdue routine maintenance"
          : "Preventive cleaning recommended",
        urgency: criticalCount > 0 ? "critical" : highCount > 0 ? "high" : "medium",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return NextResponse.json({ recommendations });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/dashboard - Get dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "7d"; // 7d, 30d, 90d

    // Calculate date range
    const now = new Date();
    const daysMap: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };
    const days = daysMap[timeframe] || 7;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Get overall statistics
    const [
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      rejectedIssues,
      totalStaff,
      activeAssignments,
      avgResolutionTime,
      topCategories,
      recentIssues,
    ] = await Promise.all([
      // Total issues in timeframe
      prisma.issue.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),

      // Pending issues
      prisma.issue.count({
        where: { status: "PENDING" },
      }),

      // In progress issues
      prisma.issue.count({
        where: { status: "IN_PROGRESS" },
      }),

      // Resolved issues in timeframe
      prisma.issue.count({
        where: {
          status: "RESOLVED",
          resolvedAt: { gte: startDate },
        },
      }),

      // Rejected issues
      prisma.issue.count({
        where: { status: "REJECTED" },
      }),

      // Active staff count
      prisma.user.count({
        where: {
          role: "STAFF",
          isActive: true,
        },
      }),

      // Active assignments
      prisma.assignment.count({
        where: {
          completedAt: null,
        },
      }),

      // Average resolution time (in hours)
      prisma.$queryRaw<Array<{ avg_hours: number }>>`
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours
        FROM "Issue"
        WHERE status = 'RESOLVED'
          AND resolved_at IS NOT NULL
          AND resolved_at >= ${startDate}
      `,

      // Top issue categories
      prisma.issue.groupBy({
        by: ["category"],
        where: {
          createdAt: { gte: startDate },
        },
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: "desc",
          },
        },
        take: 5,
      }),

      // Recent high priority issues
      prisma.issue.findMany({
        where: {
          priority: { in: ["HIGH", "CRITICAL"] },
          status: { notIn: ["RESOLVED", "REJECTED"] },
        },
        include: {
          location: {
            select: {
              name: true,
              type: true,
            },
          },
          _count: {
            select: { votes: true },
          },
        },
        orderBy: { urgencyScore: "desc" },
        take: 10,
      }),
    ]);

    // Calculate resolution rate
    const resolutionRate = totalIssues > 0 
      ? Math.round((resolvedIssues / totalIssues) * 100) 
      : 0;

    // Calculate cleanliness score (0-100)
    const cleanlinessScore = Math.max(
      0,
      100 - (pendingIssues * 2) - (inProgressIssues * 1),
    );

    const avgResolutionHours = avgResolutionTime[0]?.avg_hours || 0;

    return NextResponse.json({
      overview: {
        cleanlinessScore: Math.min(cleanlinessScore, 100),
        totalIssues,
        pendingIssues,
        inProgressIssues,
        resolvedIssues,
        rejectedIssues,
        resolutionRate,
        avgResolutionTime: Math.round(avgResolutionHours * 10) / 10,
      },
      staff: {
        totalStaff,
        activeAssignments,
        utilization: totalStaff > 0 
          ? Math.round((activeAssignments / totalStaff) * 100) 
          : 0,
      },
      categoryBreakdown: topCategories.map((cat) => ({
        category: cat.category,
        count: cat._count.category,
      })),
      urgentIssues: recentIssues,
      timeframe: {
        days,
        startDate,
        endDate: now,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}

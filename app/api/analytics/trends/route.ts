import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/trends - Get weekly/monthly trends
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "weekly"; // weekly, monthly

    const now = new Date();
    const dataPoints = period === "weekly" ? 7 : 30;
    
    // Generate date ranges for each period
    const trends = await Promise.all(
      Array.from({ length: dataPoints }, async (_, index) => {
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() - index);
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - (period === "weekly" ? 0 : 0));
        startDate.setHours(0, 0, 0, 0);

        const [reported, resolved, avgScore] = await Promise.all([
          // Issues reported
          prisma.issue.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),

          // Issues resolved
          prisma.issue.count({
            where: {
              status: "RESOLVED",
              resolvedAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),

          // Average cleanliness score
          prisma.issue.aggregate({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            _avg: {
              urgencyScore: true,
            },
          }),
        ]);

        // Calculate daily cleanliness score (inverse of avg urgency)
        const cleanlinessScore = avgScore._avg.urgencyScore 
          ? Math.max(0, 100 - avgScore._avg.urgencyScore)
          : 100;

        return {
          date: startDate.toISOString().split("T")[0],
          day: period === "weekly" 
            ? startDate.toLocaleDateString("en-US", { weekday: "short" })
            : startDate.getDate(),
          reported,
          resolved,
          pending: reported - resolved,
          cleanlinessScore: Math.round(cleanlinessScore),
        };
      }),
    );

    // Reverse to show oldest to newest
    trends.reverse();

    // Calculate trend direction
    const recentScore = trends[trends.length - 1]?.cleanlinessScore || 0;
    const previousScore = trends[Math.max(0, trends.length - 3)]?.cleanlinessScore || 0;
    const trendPercentage = previousScore > 0
      ? Math.round(((recentScore - previousScore) / previousScore) * 100)
      : 0;

    return NextResponse.json({
      trends,
      summary: {
        period,
        dataPoints,
        currentScore: recentScore,
        trendPercentage,
        totalReported: trends.reduce((sum, t) => sum + t.reported, 0),
        totalResolved: trends.reduce((sum, t) => sum + t.resolved, 0),
        avgScore: Math.round(
          trends.reduce((sum, t) => sum + t.cleanlinessScore, 0) / trends.length,
        ),
      },
    });
  } catch (error) {
    console.error("Trends analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends data" },
      { status: 500 },
    );
  }
}

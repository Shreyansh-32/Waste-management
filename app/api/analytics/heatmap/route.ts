import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/heatmap - Get location heatmap data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "7d";
    const locationType = searchParams.get("type"); // Optional filter by location type

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

    // Get issue count by location
    const whereClause: any = {
      createdAt: { gte: startDate },
    };

    const locationWhere: any = {};
    if (locationType) {
      locationWhere.type = locationType;
    }

    const heatmapData = await prisma.location.findMany({
      where: locationWhere,
      include: {
        parent: {
          select: {
            name: true,
            type: true,
          },
        },
        issues: {
          where: whereClause,
          select: {
            id: true,
            status: true,
            priority: true,
            category: true,
            urgencyScore: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    // Transform to heatmap format with risk scoring
    const heatmap = heatmapData.map((location) => {
      const activeIssues = location.issues.filter(
        (issue) => issue.status !== "RESOLVED" && issue.status !== "REJECTED",
      );

      const criticalCount = activeIssues.filter(
        (i) => i.priority === "CRITICAL",
      ).length;
      const highCount = activeIssues.filter(
        (i) => i.priority === "HIGH",
      ).length;

      // Calculate risk score (0-100)
      const riskScore = Math.min(
        100,
        criticalCount * 30 + highCount * 15 + activeIssues.length * 5,
      );

      // Determine risk level
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      if (riskScore >= 70) riskLevel = "CRITICAL";
      else if (riskScore >= 40) riskLevel = "HIGH";
      else if (riskScore >= 20) riskLevel = "MEDIUM";
      else riskLevel = "LOW";

      return {
        locationId: location.id,
        locationName: location.name,
        locationType: location.type,
        parentLocation: location.parent?.name,
        coordinates: location.gpsLat && location.gpsLng 
          ? { lat: location.gpsLat, lng: location.gpsLng } 
          : null,
        totalIssues: location._count.issues,
        activeIssues: activeIssues.length,
        resolvedIssues: location.issues.length - activeIssues.length,
        criticalIssues: criticalCount,
        highPriorityIssues: highCount,
        riskScore,
        riskLevel,
        categoryBreakdown: location.issues.reduce((acc: Record<string, number>, issue) => {
          acc[issue.category] = (acc[issue.category] || 0) + 1;
          return acc;
        }, {}),
        avgUrgencyScore: activeIssues.length > 0
          ? Math.round(
              activeIssues.reduce((sum, i) => sum + i.urgencyScore, 0) /
                activeIssues.length,
            )
          : 0,
      };
    });

    // Sort by risk score descending
    heatmap.sort((a, b) => b.riskScore - a.riskScore);

    // Find hotspots (top 10 high-risk locations)
    const hotspots = heatmap.slice(0, 10);

    return NextResponse.json({
      heatmap,
      hotspots,
      summary: {
        totalLocations: heatmap.length,
        criticalLocations: heatmap.filter((l) => l.riskLevel === "CRITICAL").length,
        highRiskLocations: heatmap.filter((l) => l.riskLevel === "HIGH").length,
        mediumRiskLocations: heatmap.filter((l) => l.riskLevel === "MEDIUM").length,
        lowRiskLocations: heatmap.filter((l) => l.riskLevel === "LOW").length,
      },
      timeframe: {
        days,
        startDate,
        endDate: now,
      },
    });
  } catch (error) {
    console.error("Heatmap analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmap data" },
      { status: 500 },
    );
  }
}

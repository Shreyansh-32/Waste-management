import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/locations/qr/[code] - Lookup location by QR code
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const location = await prisma.location.findUnique({
      where: { qrCode: params.code },
      include: {
        parent: {
          include: {
            parent: true, // Include grandparent for full path
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        issues: {
          where: {
            status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
          },
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { urgencyScore: "desc" },
          take: 5,
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found for this QR code" },
        { status: 404 },
      );
    }

    // Build full location path
    const path = [];
    let current = location;
    while (current) {
      path.unshift({
        id: current.id,
        name: current.name,
        type: current.type,
      });
      current = current.parent as any;
    }

    return NextResponse.json({
      location: {
        ...location,
        fullPath: path,
      },
    });
  } catch (error) {
    console.error("QR lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup location" },
      { status: 500 },
    );
  }
}

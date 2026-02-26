import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/locations/[id] - Get single location by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ location });
  } catch (error) {
    console.error("Get location error:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}

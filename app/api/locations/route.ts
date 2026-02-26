import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLocationSchema } from "@/lib/validations/location";
import { z } from "zod";

// GET /api/locations - Get all locations (hierarchical)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const parentId = searchParams.get("parentId");

    const where: any = {};
    if (type) where.type = type;
    if (parentId) where.parentId = parentId;

    const locations = await prisma.location.findMany({
      where,
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
            qrCode: true,
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Get locations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}

// POST /api/locations - Create new location (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createLocationSchema.parse(body);

    // Check if QR code already exists
    if (validatedData.qrCode) {
      const existingQR = await prisma.location.findUnique({
        where: { qrCode: validatedData.qrCode },
      });

      if (existingQR) {
        return NextResponse.json(
          { error: "QR code already in use" },
          { status: 400 },
        );
      }
    }

    const location = await prisma.location.create({
      data: validatedData,
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json({ location }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error);
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Create location error:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 },
    );
  }
}

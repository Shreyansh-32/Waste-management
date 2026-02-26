import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createIssueSchema, issueQuerySchema } from "@/lib/validations/issue";
import { calculateInitialPriority, calculateDueDate, calculateUrgencyScore } from "@/lib/urgency";
import { classifyIssueFromImages } from "@/lib/gemini";
import { z } from "zod";

// POST /api/issues - Create new issue report
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createIssueSchema.parse(body);

    // Use user-provided category and let Gemini AI suggest priority from images
    const finalCategory = validatedData.category;
    const initialPriority = calculateInitialPriority(
      finalCategory,
      validatedData.description,
    );

    let aiClassification: Awaited<ReturnType<typeof classifyIssueFromImages>> = null;
    try {
      aiClassification = await classifyIssueFromImages({
        description: validatedData.description,
        imageUrls: validatedData.photoUrls,
      });
    } catch (error) {
      console.error('[Issue Creation] Gemini AI classification failed:', error);
      aiClassification = null;
    }

    const finalPriority = aiClassification?.priority ?? initialPriority;
    
    // Use Gemini's urgency score if available, otherwise calculate locally
    let urgencyScore: number;
    if (aiClassification?.urgencyScore !== undefined) {
      urgencyScore = aiClassification.urgencyScore;
      console.log('[Issue Creation] Using Gemini urgency score:', urgencyScore);
    } else {
      urgencyScore = calculateUrgencyScore({
        category: finalCategory,
        priority: finalPriority,
        voteCount: 0,
        escalationLevel: 0,
        ageInHours: 0,
        description: validatedData.description,
        photoCount: validatedData.photoUrls.length,
      });
      console.log('[Issue Creation] Using calculated urgency score:', urgencyScore);
    }
    
    console.log('[Issue Creation] Priority decision:', {
      aiPriority: aiClassification?.priority,
      fallbackPriority: initialPriority,
      finalPriority,
      urgencyScore,
      category: finalCategory,
    });

    const dueAt = calculateDueDate(finalPriority);

    // Create issue with photos in a transaction
    const issue = await prisma.$transaction(async (tx) => {
      const newIssue = await tx.issue.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          category: finalCategory,
          priority: finalPriority,
          urgencyScore,
          dueAt,
          isAnonymous: validatedData.isAnonymous,
          locationId: validatedData.locationId,
          reporterId: validatedData.isAnonymous ? null : session.user.id,
        },
        include: {
          location: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Create photos
      await tx.issuePhoto.createMany({
        data: validatedData.photoUrls.map((url) => ({
          issueId: newIssue.id,
          url,
          kind: "BEFORE",
        })),
      });

      // Create status history entry
      await tx.statusHistory.create({
        data: {
          issueId: newIssue.id,
          toStatus: "PENDING",
          changedById: session.user.id,
          note: "Issue created",
        },
      });

      return newIssue;
    });

    // Notify admins about new high/critical priority issues
    if (finalPriority === "HIGH" || finalPriority === "CRITICAL") {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", isActive: true },
        select: { id: true },
      });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            issueId: issue.id,
            type: "ESCALATION",
            message: `New ${finalPriority} priority issue reported: ${issue.title || issue.description.slice(0, 50)}`,
          })),
        });
      }
    }

    return NextResponse.json({ issue }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Create issue error:", error);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 },
    );
  }
}

// GET /api/issues - List issues with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams);
    const filters = issueQuerySchema.parse(queryParams);

    // Build where clause
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.priority) where.priority = filters.priority;
    if (filters.locationId) where.locationId = filters.locationId;
    if (filters.reporterId) where.reporterId = filters.reporterId;

    // Role-based filtering
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Students/Faculty can only see their own reports or public ones
    if (user?.role === "STUDENT" || user?.role === "FACULTY") {
      where.OR = [
        { reporterId: session.user.id },
        { isAnonymous: false },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              type: true,
              qrCode: true,
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          photos: {
            where: { kind: "BEFORE" },
            take: 1,
          },
          assignments: {
            include: {
              staff: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: { assignedAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip,
        take: filters.limit,
      }),
      prisma.issue.count({ where }),
    ]);

    return NextResponse.json({
      issues,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Get issues error:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const issues = await prisma.issue.findMany({
    where: { reporterId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      location: { select: { name: true, type: true } },
      photos: { where: { kind: "BEFORE" }, take: 1 },
      assignments: {
        where: { completedAt: null },
        include: { staff: { select: { name: true } } },
        take: 1,
      },
    },
  });

  return NextResponse.json({ issues });
}

const editSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await request.json();
  const parsed = editSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const { id, ...data } = parsed.data;

  // Only allow editing if still PENDING
  const issue = await prisma.issue.findFirst({
    where: { id, reporterId: userId, status: "PENDING" },
  });

  if (!issue) {
    return NextResponse.json({ message: "Issue not found or cannot be edited" }, { status: 404 });
  }

  const updated = await prisma.issue.update({
    where: { id },
    data,
  });

  return NextResponse.json({ issue: updated });
}

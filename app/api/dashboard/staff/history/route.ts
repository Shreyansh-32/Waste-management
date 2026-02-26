import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const [assignments, user] = await Promise.all([
    prisma.assignment.findMany({
      where: { staffId: userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      include: {
        issue: {
          include: {
            location: { select: { name: true, type: true } },
            photos: { take: 2 },
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { reputationScore: true, name: true, email: true },
    }),
  ]);

  return NextResponse.json({ assignments, user });
}

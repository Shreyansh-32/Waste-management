import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateUrgencyScore } from "@/lib/urgency";

// POST /api/issues/[id]/vote - Vote on issue (toggle)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: params.id },
      include: {
        photos: true,
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Check if user already voted
    const existingVote = await prisma.issueVote.findUnique({
      where: {
        issueId_userId: {
          issueId: params.id,
          userId: session.user.id,
        },
      },
    });

    let action: "voted" | "unvoted";
    let newVoteCount: number;

    if (existingVote) {
      // Remove vote
      await prisma.issueVote.delete({
        where: { id: existingVote.id },
      });
      action = "unvoted";
      newVoteCount = issue._count.votes - 1;
    } else {
      // Add vote
      await prisma.issueVote.create({
        data: {
          issueId: params.id,
          userId: session.user.id,
        },
      });
      action = "voted";
      newVoteCount = issue._count.votes + 1;
    }

    // Recalculate urgency score with new vote count
    const ageInHours = Math.floor(
      (Date.now() - issue.createdAt.getTime()) / (1000 * 60 * 60),
    );
    const urgencyScore = calculateUrgencyScore({
      category: issue.category,
      priority: issue.priority,
      voteCount: newVoteCount,
      escalationLevel: issue.escalationLevel,
      ageInHours,
      description: issue.description,
      photoCount: issue.photos.length,
    });

    // Update issue with new urgency score
    await prisma.issue.update({
      where: { id: params.id },
      data: { urgencyScore },
    });

    // Escalate if votes exceed threshold
    if (newVoteCount >= 5 && issue.escalationLevel === 0) {
      await prisma.$transaction([
        prisma.issue.update({
          where: { id: params.id },
          data: { escalationLevel: 1 },
        }),
        prisma.notification.create({
          data: {
            userId: issue.reporterId || "", // Notify reporter or admin
            issueId: params.id,
            type: "ESCALATION",
            message: `Issue "${issue.title || issue.description.slice(0, 50)}" has gained significant attention (${newVoteCount} votes)`,
          },
        }),
      ]);
    }

    return NextResponse.json({
      action,
      voteCount: newVoteCount,
      urgencyScore,
    });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}

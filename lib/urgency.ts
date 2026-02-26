import type { IssueCategory, PriorityLevel } from "@/lib/generated/prisma";

/**
 * Calculate urgency score for an issue based on multiple factors
 * Score range: 0-100
 */
export function calculateUrgencyScore(params: {
  category: IssueCategory;
  priority: PriorityLevel;
  voteCount: number;
  escalationLevel: number;
  ageInHours: number;
}): number {
  const { category, priority, voteCount, escalationLevel, ageInHours } = params;

  let score = 0;

  // Category weight (0-25 points)
  const categoryWeights: Record<IssueCategory, number> = {
    WASHROOM: 25,
    CANTEEN: 20,
    CORRIDOR: 15,
    CLASSROOM: 15,
    LAB: 15,
    HOSTEL: 12,
    OUTDOOR: 8,
    OTHER: 5,
  };
  score += categoryWeights[category];

  // Priority weight (0-30 points)
  const priorityWeights: Record<PriorityLevel, number> = {
    CRITICAL: 30,
    HIGH: 20,
    MEDIUM: 10,
    LOW: 5,
  };
  score += priorityWeights[priority];

  // Vote count (0-20 points) - more votes = more urgent
  score += Math.min(voteCount * 2, 20);

  // Escalation level (0-15 points)
  score += Math.min(escalationLevel * 5, 15);

  // Age factor (0-10 points) - older issues get higher score
  const ageScore = Math.min(Math.floor(ageInHours / 6), 10); // +1 point per 6 hours, max 10
  score += ageScore;

  return Math.min(score, 100);
}

/**
 * Auto-assign priority based on category and initial assessment
 */
export function calculateInitialPriority(
  category: IssueCategory,
  description: string,
): PriorityLevel {
  const desc = description.toLowerCase();
  
  // Critical keywords
  const criticalKeywords = ["emergency", "urgent", "overflow", "leak", "broken", "hazard", "injury"];
  const hasCriticalKeyword = criticalKeywords.some((keyword) => desc.includes(keyword));
  
  if (hasCriticalKeyword) {
    return "CRITICAL";
  }

  // High priority categories
  const highPriorityCategories: IssueCategory[] = ["WASHROOM", "CANTEEN"];
  if (highPriorityCategories.includes(category)) {
    return "HIGH";
  }

  // Medium by default
  return "MEDIUM";
}

/**
 * Calculate due date based on priority
 */
export function calculateDueDate(priority: PriorityLevel): Date {
  const now = new Date();
  const hoursToAdd: Record<PriorityLevel, number> = {
    CRITICAL: 2,  // 2 hours
    HIGH: 12,     // 12 hours
    MEDIUM: 24,   // 1 day
    LOW: 72,      // 3 days
  };

  now.setHours(now.getHours() + hoursToAdd[priority]);
  return now;
}

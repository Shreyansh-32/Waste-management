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
  description?: string;
  photoCount?: number;
}): number {
  const { category, priority, voteCount, escalationLevel, ageInHours, description, photoCount } = params;

  let score = 0;

  // Category weight (0-20 points) - reduced from 25 to allow more variance
  const categoryWeights: Record<IssueCategory, number> = {
    WASHROOM: 20,
    CANTEEN: 18,
    CORRIDOR: 15,
    CLASSROOM: 15,
    LAB: 15,
    HOSTEL: 12,
    OUTDOOR: 10,
    OTHER: 8,
  };
  score += categoryWeights[category];

  // Priority weight (0-35 points) - increased range for more differentiation
  const priorityWeights: Record<PriorityLevel, number> = {
    CRITICAL: 35,
    HIGH: 25,
    MEDIUM: 15,
    LOW: 5,
  };
  score += priorityWeights[priority];

  // Description-based urgency indicators (0-20 points) - increased range for more variety
  if (description) {
    const desc = description.toLowerCase();
    let descScore = 0;
    
    // Severe urgency keywords (+12-16 points)
    if (desc.match(/\b(urgent|emergency|immediate|asap|critical|severe|dangerous)\b/)) descScore += 16;
    // High urgency
    else if (desc.match(/\b(overflow|leak|broken|smell|odor|pest|rat|cockroach|filthy|disgusting)\b/)) descScore += 12;
    // Medium urgency
    else if (desc.match(/\b(dirty|messy|needs cleaning|very dirty|trash|scattered)\b/)) descScore += 7;
    // Low urgency
    else if (desc.match(/\b(small|minor|little|bit|dust|spot|light stain)\b/)) descScore -= 3;
    
    // Description length suggests detail/severity
    if (description.length > 300) descScore += 5;
    else if (description.length > 200) descScore += 3;
    else if (description.length > 100) descScore += 2;
    else if (description.length < 20) descScore -= 4;
    
    // Word count indicators
    const wordCount = description.split(/\s+/).length;
    if (wordCount > 50) descScore += 3;
    else if (wordCount < 5) descScore -= 2;
    
    // Exclamation marks indicate urgency
    if (description.includes('!')) descScore += 2;
    
    score += Math.max(0, Math.min(descScore, 20));
  }

  // Photo count (0-10 points) - more photos = more evidence of severity
  if (photoCount && photoCount > 0) {
    score += Math.min(photoCount * 3, 10);
  }

  // Vote count (0-15 points) - community validation
  score += Math.min(voteCount * 2, 15);

  // Escalation level (0-10 points)
  score += Math.min(escalationLevel * 5, 10);

  // Age factor (0-5 points) - reduced weight, older issues get slight boost
  const ageScore = Math.min(Math.floor(ageInHours / 12), 5);
  score += ageScore;

  return Math.min(score, 100);
}

/**
 * Auto-assign priority based on category and initial assessment
 * This is a fallback when AI classification is unavailable
 */
export function calculateInitialPriority(
  category: IssueCategory,
  description: string,
): PriorityLevel {
  const desc = description.toLowerCase();
  
  // Critical keywords - severe hazards
  const criticalKeywords = [
    "emergency", "sewage", "biohazard", "injury", "broken glass", "structural damage", 
    "major leak", "flood", "blood", "immediate", "critical", "urgent danger"
  ];
  const hasCriticalKeyword = criticalKeywords.some((keyword) => desc.includes(keyword));
  if (hasCriticalKeyword) return "CRITICAL";

  // High priority keywords - significant issues that need attention soon
  const highKeywords = [
    "overflow", "leak", "foul smell", "odor", "pest", "rats", "cockroach", 
    "large spill", "very dirty", "smell", "broken", "damage", "mess"
  ];
  const hasHighKeyword = highKeywords.some((keyword) => desc.includes(keyword));
  if (hasHighKeyword) return "HIGH";

  // Low priority keywords - minor issues
  const lowKeywords = [
    "small", "minor", "tiny", "dust", "little spot", "light", "aesthetic", "cosmetic"
  ];
  const hasLowKeyword = lowKeywords.some((keyword) => desc.includes(keyword));
  if (hasLowKeyword) return "LOW";

  // Check if description length suggests severity
  if (description.length > 300) return "HIGH"; // Detailed problems are serious
  if (description.length < 20) return "LOW"; // Vague = not urgent
  
  // Default to MEDIUM for most cases
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

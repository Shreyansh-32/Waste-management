import { z } from "zod";

// Enums matching Prisma schema
export const issueCategorySchema = z.enum([
  "WASHROOM",
  "CLASSROOM",
  "HOSTEL",
  "CANTEEN",
  "CORRIDOR",
  "LAB",
  "OUTDOOR",
  "OTHER",
]);

export const issueStatusSchema = z.enum([
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
]);

export const priorityLevelSchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

// Create issue validation
export const createIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  category: issueCategorySchema,
  locationId: z.string().cuid(),
  isAnonymous: z.boolean().default(false),
  photoUrls: z.array(z.string().url()).min(1, "At least one photo is required").max(5),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;

// Update issue validation
export const updateIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  category: issueCategorySchema.optional(),
  status: issueStatusSchema.optional(),
  priority: priorityLevelSchema.optional(),
});

export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;

// Query filters validation
export const issueQuerySchema = z.object({
  status: issueStatusSchema.optional(),
  category: issueCategorySchema.optional(),
  priority: priorityLevelSchema.optional(),
  locationId: z.string().cuid().optional(),
  reporterId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "urgencyScore", "priority", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type IssueQueryInput = z.infer<typeof issueQuerySchema>;

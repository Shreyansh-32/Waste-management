import { z } from "zod";

// Create assignment validation
export const createAssignmentSchema = z.object({
  issueId: z.string().cuid(),
  staffId: z.string().cuid(),
  note: z.string().max(500).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

// Complete assignment validation
export const completeAssignmentSchema = z.object({
  completionNote: z.string().min(10, "Please provide details about the completion").max(1000),
  completionPhotoUrl: z.string().url("Please upload a completion photo"),
});

export type CompleteAssignmentInput = z.infer<typeof completeAssignmentSchema>;

// Update assignment status
export const updateAssignmentSchema = z.object({
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  completionNote: z.string().max(1000).optional(),
});

export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;

import { z } from "zod";

export const locationTypeSchema = z.enum([
  "CAMPUS",
  "BUILDING",
  "BLOCK",
  "FLOOR",
  "ROOM",
  "AREA",
]);

// Create location validation
export const createLocationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(200),
  type: locationTypeSchema,
  parentId: z.string().cuid().nullable().optional(),
  qrCode: z.string().min(1).max(100).nullable().optional(),
  gpsLat: z.number().min(-90).max(90).nullable().optional(),
  gpsLng: z.number().min(-180).max(180).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
}).strict();

export type CreateLocationInput = z.infer<typeof createLocationSchema>;

// Update location validation
export const updateLocationSchema = createLocationSchema.partial();

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

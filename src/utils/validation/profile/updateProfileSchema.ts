import { z } from "zod";

export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters")
      .optional(),
  })
  .refine(
    (data) => data.fullName !== undefined,
    {
      message: "At least one profile field must be provided",
    }
  );

export type UpdateProfileInput = z.infer<
  typeof updateProfileSchema
>;
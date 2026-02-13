import { z } from "zod";

export const updateUserBookSchema = z
  .object({
    status: z.enum(["to-read", "reading", "completed", "on-hold"]).optional(),
    lastPosition: z.number().int().min(0).optional(),
    totalPages: z.number().int().min(1).optional(),
    isFavorite: z.boolean().optional(),
    lastReadAt: z.iso.datetime().optional(),
    finishedAt: z.iso.datetime().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "No data provided",
  });

export type UserBookUpdate = z.infer<typeof updateUserBookSchema>;

export const validateUserBook = (input: UserBookUpdate) => {
  return updateUserBookSchema.safeParse(input);
};

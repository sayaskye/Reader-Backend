import { z } from "zod";

export const uploadBookSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type === "application/epub+zip", {
      message: "Only .epub files are allowed",
    })
    .refine((file) => file.size <= 50 * 1024 * 1024, {
      message: "This file is too big (max 50MB)",
    }),
});

export type uploadEpub = z.infer<typeof uploadBookSchema>;

export const validateUploadEpub = (input: uploadEpub) => {
  return uploadBookSchema.safeParse(input);
};

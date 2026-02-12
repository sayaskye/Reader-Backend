import * as z from "zod";

export const BookSchema = z.object({
  id: z.uuid(),
  url: z.string(),
  coverUrl: z.string().nullable().optional(),
  title: z.string(),
  author: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  publisher: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  tableOfContents: z.array(z.string()).nullable().optional(),
  fileSize: z.bigint(),
  filename: z.string(),
  ownerId: z.uuid(),
  fileHash: z.string(),
  uploadedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

const CreateBookSchema = z.object({
  url: z.string(),
  coverUrl: z.string().nullable().optional(),
  title: z.string(),
  author: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  publisher: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  tableOfContents: z.array(z.string()).nullable().optional(),
  fileSize: z.bigint(),
  filename: z.string(),
  ownerId: z.uuid(),
  fileHash: z.string(),
});

export type Book = z.infer<typeof BookSchema>;
export type CreateBook = z.infer<typeof CreateBookSchema>;

export const validateBook = (input: CreateBook) => {
  return CreateBookSchema.safeParse(input);
};
export const validatePartialBook = (input: CreateBook) => {
  return CreateBookSchema.partial().safeParse(input);
};

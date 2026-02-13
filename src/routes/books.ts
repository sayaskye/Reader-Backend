import { Hono } from "hono";

import { validateUUID } from "@/schemas/id";
import { BooksController } from "@/controllers/books";
import { validateUploadEpub } from "@/schemas/upload-epub";

import { validateEPUB, validateParam } from "@/middlewares/zod-validators";
import { authMiddleware, requireAdmin } from "@/middlewares/auth";

export const books = new Hono();

books.post(
  "/",
  authMiddleware,
  validateEPUB(validateUploadEpub),
  BooksController.createBook,
);

books.get("/my-books", authMiddleware, BooksController.getMyBooks);
books.get(
  "/my-books/:id",
  authMiddleware,
  validateParam(validateUUID, "id"),
  BooksController.getMyBookById,
);
books.delete(
  "/my-books/:id",
  authMiddleware,
  validateParam(validateUUID, "id"),
  BooksController.deleteMyBookById,
);

books.get("/", authMiddleware, requireAdmin, BooksController.getBooks);
books.get(
  "/:id",
  authMiddleware,
  requireAdmin,
  validateParam(validateUUID, "id"),
  BooksController.getBookById,
);
books.delete(
  "/:id",
  authMiddleware,
  validateParam(validateUUID, "id"),
  BooksController.deleteBookById,
);

//There is no need to update info, because all data comes from epub metadata

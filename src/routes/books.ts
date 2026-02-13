import { Hono } from "hono";

import { validateUUID } from "@/schemas/id";
import { BooksController } from "@/controllers/books";
import { validateUploadEpub } from "@/schemas/upload-epub";

import { validateEPUB, validateParam } from "@/middlewares/zod-validators";
import { authMiddleware, requireAdmin } from "@/middlewares/auth";
import { UserBooksController } from "@/controllers/user-books";

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
  UserBooksController.deleteMyBookById,
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
  requireAdmin,
  validateParam(validateUUID, "id"),
  BooksController.deleteBookById,
);
books.delete(
  "/user/:userId/book/:bookId",
  authMiddleware,
  requireAdmin,
  validateParam(validateUUID, "bookId"),
  validateParam(validateUUID, "userId"),
  UserBooksController.deleteUserBookById,
);

//There is no need to update info, because all data comes from epub metadata

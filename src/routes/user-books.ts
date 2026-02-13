import { Hono } from "hono";

import { validateUUID } from "@/schemas/id";

import { validateBody, validateParam } from "@/middlewares/zod-validators";
import { validateUserBook } from "@/schemas/user-books";
import { authMiddleware } from "@/middlewares/auth";
import { UserBooksController } from "@/controllers/user-books";

export const userBooks = new Hono();

userBooks.get("/my-books", authMiddleware, UserBooksController.getMyBooks);
userBooks.patch(
  "/:id",
  authMiddleware,
  validateBody(validateUserBook),
  validateParam(validateUUID, "id"),
  UserBooksController.update,
);

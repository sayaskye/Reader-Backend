import { Hono } from "hono";

import { validateUUID } from "@/schemas/id";

import { validateParam } from "@/middlewares/zod-validators";
import { authMiddleware } from "@/middlewares/auth";
import { UserBooksController } from "@/controllers/user-books";

export const userBooks = new Hono();

userBooks.get("/my-books", authMiddleware, UserBooksController.getMyBooks);
userBooks.patch(
  "/:id",
  authMiddleware,
  validateParam(validateUUID, "id"),
  UserBooksController.update,
);

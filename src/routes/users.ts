import { Hono } from "hono";

import { UsersController } from "@/controllers/users";
import { validateUUID } from "@/schemas/id";
import { validatePartialUser } from "@/schemas/users";

import { validateBody, validateParam } from "@/middlewares/zod-validators";
import { authMiddleware, requireAdmin } from "@/middlewares/auth";

export const users = new Hono();

users.get("/me", authMiddleware, UsersController.getMe);
users.patch("/me", authMiddleware, validateBody(validatePartialUser), UsersController.partialUpdateMe);
users.delete("/me", authMiddleware, UsersController.deleteMe);

users.get("/",authMiddleware, requireAdmin, UsersController.getAll);
users.get("/:id",authMiddleware, requireAdmin, validateParam(validateUUID, "id"), UsersController.getById);
users.patch("/:id",authMiddleware, requireAdmin, validateBody(validatePartialUser), validateParam(validateUUID, "id"), UsersController.partialUpdateId);
users.delete("/:id",authMiddleware, requireAdmin, validateParam(validateUUID, "id"), UsersController.deleteById);

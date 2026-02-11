import { Hono } from "hono";

import { UsersController } from "@/controllers/users";
import { validatePartialUser, validateUUID } from "@/schemas/users";

import { validateBody, validateParam } from "@/middlewares/zod-validators";
import { authMiddleware } from "@/middlewares/auth";

export const users = new Hono();

//TODO: user can delete their account if they want to
users.get("/me", authMiddleware, UsersController.getId);
users.patch("/me", authMiddleware, validateBody(validatePartialUser), UsersController.partialUpdate);

//TODO: Adjust endpoints by roles, only admin can delete and watch all users
users.get("/", UsersController.getAll);
users.get("/:id", validateParam(validateUUID, "id"), UsersController.getId);
users.patch("/:id", validateBody(validatePartialUser), validateParam(validateUUID, "id"), UsersController.partialUpdate);
users.delete("/:id", validateParam(validateUUID, "id"), UsersController.delete);

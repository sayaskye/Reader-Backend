import { Hono } from "hono";

import { UserRolesController } from "@/controllers/user-roles";
import { validateBody, validateParam } from "@/middlewares/zod-validators";
import { authMiddleware, requireAdmin } from "@/middlewares/auth";
import { validateUUID } from "@/schemas/id";
import { validateRegisterUserRole } from "@/schemas/user-roles";

export const userRoles = new Hono();

userRoles.post(
  "/",
  authMiddleware,
  requireAdmin,
  validateBody(validateRegisterUserRole),
  UserRolesController.create,
);
userRoles.delete(
  "/user/:userId/role/:roleId",
  authMiddleware,
  requireAdmin,
  validateParam(validateUUID, "userId"),
  validateParam(validateUUID, "roleId"),
  UserRolesController.delete,
);

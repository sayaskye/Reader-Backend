import { Hono } from "hono";

import { RolesController } from "@/controllers/roles";
import { validateBody, validateParam } from "@/middlewares/zod-validators";
import { validateUUID } from "@/schemas/id";
import { validateRegisterRole } from "@/schemas/roles";
import { authMiddleware, requireAdmin } from '@/middlewares/auth';

export const roles = new Hono();

roles.post("/", authMiddleware, requireAdmin, validateBody(validateRegisterRole), RolesController.create);
roles.delete("/:id", authMiddleware, requireAdmin, validateParam(validateUUID, "id"), RolesController.delete);

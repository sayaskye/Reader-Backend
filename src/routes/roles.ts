import { Hono } from "hono";

import { RolesController } from "@/controllers/roles";
import { validateBody, validateParam } from "@/middlewares/zod-validators";
import { validateUUID } from "@/schemas/id";
import { validateRegisterRole } from "@/schemas/roles";

export const roles = new Hono();

//TODO: Only admin can post and delete
roles.post("/", validateBody(validateRegisterRole), RolesController.create);
roles.delete("/:id", validateParam(validateUUID, "id"), RolesController.delete);

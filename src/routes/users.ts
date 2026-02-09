import { Hono } from "hono";

import { UsersController } from "@/controllers/users";
import {
  validatePartialUser,
  validateUser,
  validateUUID,
} from "@/schemas/users";

import { validateBody, validateParam } from "@/middlewares/zodValidators";

export const users = new Hono();

users.get("/", UsersController.getAll);
users.get("/:id", validateParam(validateUUID, "id"), UsersController.getId);
users.post("/", validateBody(validateUser), UsersController.create);
users.put("/:id", validateBody(validatePartialUser), validateParam(validateUUID, "id"), UsersController.update);
users.patch("/:id", validateBody(validatePartialUser), validateParam(validateUUID, "id"), UsersController.partialUpdate);
users.delete("/:id", validateParam(validateUUID, "id"), UsersController.delete);

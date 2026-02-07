import { Hono } from "hono";

import { UsersController } from "@/controllers/users";
import {
  validatePartialUser,
  validateUser,
  validateUUID,
} from "@/schemas/users";

import { validate } from "@/middlewares/zodValidators";

export const users = new Hono();

users.get("/", UsersController.getAll);
users.get("/:id", validate(validateUUID, "param", "id"), UsersController.getId);
users.post("/", validate(validateUser), UsersController.create);
users.put("/:id", validate(validatePartialUser), validate(validateUUID, "param", "id"), UsersController.update);
users.patch("/:id", validate(validatePartialUser), validate(validateUUID, "param", "id"), UsersController.partialUpdate);
users.delete("/:id", validate(validateUUID, "param", "id"), UsersController.delete);

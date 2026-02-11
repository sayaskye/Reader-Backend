import { Hono } from "hono";

import { UsersController } from "@/controllers/users";
import { validatePartialUser, validateUUID } from "@/schemas/users";

import { validateBody, validateParam } from "@/middlewares/zod-validators";

export const users = new Hono();
//TODO: Adjust endpoints by roles, only admin can delete and watch all users
users.get("/", UsersController.getAll);
users.get("/:id", validateParam(validateUUID, "id"), UsersController.getId);
users.patch("/:id", validateBody(validatePartialUser), validateParam(validateUUID, "id"), UsersController.partialUpdate);
users.delete("/:id", validateParam(validateUUID, "id"), UsersController.delete);
//Disabled, there is no need to make this endpoints in reality
//users.post("/", validateBody(validateUser), UsersController.create);
//users.put("/:id", validateBody(validatePartialUser), validateParam(validateUUID, "id"), UsersController.update);

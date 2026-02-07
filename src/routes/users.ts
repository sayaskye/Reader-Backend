import { Hono, Next } from "hono";

import { UsersController } from "@/controllers/users";
import {
  validatePartialUser,
  validateUser,
  validateUUID,
} from "@/schemas/users";

import type { HonoContext } from "@/types/hono";

export const users = new Hono();

//TODO: Create generic middleware to validate create and update
async function validateId(c: HonoContext, next: Next){
  const validationResult = validateUUID({id: c.req.param("id")});
  if (validationResult.success) {
    return next();
  }
  return c.json({ message: "Invalid id" }, 400);
}

async function validateCreate(c: HonoContext, next: Next) {
  const validationResult = validateUser(await c.req.json());
  if (validationResult.success) {
    return next();
  }
  return c.json({ error: "Invalid request" }, 400);
}

async function validateUpdate(c: HonoContext, next: Next) {
  const validationResult = validatePartialUser(await c.req.json());
  if (validationResult.success) {
    return next();
  }
  return c.json({ error: "Invalid request" }, 400);
}

users.get("/", UsersController.getAll);
users.get("/:id", validateId, UsersController.getId);
users.post("/", validateCreate, UsersController.create);
users.put("/:id", validateUpdate, validateId, UsersController.update);
users.patch("/:id", validateUpdate, validateId, UsersController.partialUpdate);
users.delete("/:id", validateId, UsersController.delete);

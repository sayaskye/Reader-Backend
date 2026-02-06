import { Hono, Next } from "hono";

import { UsersController } from "@/controllers/users";
import { User as bodyUser, validatePartialUser, validateUser } from "@/schemas/users";

import type { HonoContext } from "@/types/hono";

export const users = new Hono();

async function validateCreate(c: HonoContext, next: Next) {
  const body: bodyUser = await c.req.json();
  const validationResult = validateUser(body);
  if (validationResult.success) {
    //TODO: Delete console log
    console.log(body);
    return next();
  }
  c.status(400);
  return c.json({
    error: "Invalid request",
    details: validationResult.error,
  });
}

async function validateUpdate(c: HonoContext, next: Next) {
  const body: bodyUser = await c.req.json();
  const validationResult = validatePartialUser(body);
  if (validationResult.success) {
    //TODO: Verify the succes condition, it's not denying with wrong fields, only with wrong conditions
    console.log(body);
    return next();
  }
  c.status(400);
  return c.json({
    error: "Invalid request",
    details: validationResult.error,
  });
}

users.get("/", UsersController.getAll);
users.get("/:id", UsersController.getId);
users.post("/", validateCreate, UsersController.create);
users.patch("/:id", validateUpdate, UsersController.partialUpdate);
users.put("/:id", validateUpdate, UsersController.update);
users.delete("/:id", UsersController.delete);

import { UsersService } from "@/services/users";

import type { HonoContext } from "@/types/hono";

export class UsersController {
  static async getAll(c: HonoContext) {
    const users = await UsersService.getAll();
    if (users) {
      return c.json(users, 200);
    }
    return c.json({ message: "Couldn't find users" }, 404);
  }

  static async getId(c: HonoContext) {
    const user = await UsersService.getById(c.req.param("id"));
    if (user) {
      return c.json(user, 200);
    }
    return c.json({ message: "User not found" }, 404);
  }

  static async create(c: HonoContext) {
    const user = await UsersService.create(await c.req.json());
    if (user) {
      return c.json(user, 201);
    }
    return c.json({ message: "Couldn't create user" }, 404);
  }

  static async update(c: HonoContext) {
    const user = await UsersService.update(
      c.req.param("id"),
      await c.req.json(),
    );
    if (user) {
      return c.json(user, 200);
    }
    return c.json({ message: "Couldn't update user" }, 404);
  }

  static async partialUpdate(c: HonoContext) {
    const user = await UsersService.partialUpdate(
      c.req.param("id"),
      await c.req.json(),
    );
    if (user) {
      return c.json(user, 200);
    }
    return c.json({ message: "Couldn't patch user" }, 404);
  }

  static async delete(c: HonoContext) {
    const deleted = await UsersService.delete(c.req.param("id"));
    if (deleted) {
      return c.json({ "Succesfully deleted user: ": deleted }, 200);
    }
    return c.json({ message: "User not found" }, 404);
  }
}

import type { Context } from 'hono'

import { UsersService } from "@/services/users";
import { validators } from "@/middlewares/zodValidators";

export class UsersController {
  static async getAll(c: Context) {
    const users = await UsersService.getAll();
    if (users) {
      return c.json(users, 200);
    }
    return c.json({ error: "Couldn't find users" }, 404);
  }

  static async getId(c: Context) {
    const user = await UsersService.getById(c.get(validators.VALIDATED_PARAM)) ;
    if (user) {
      return c.json(user, 200);
    }
    return c.json({ error: "User not found" }, 404);
  }

  static async create(c: Context) {
    const user = await UsersService.create(c.get(validators.VALIDATED_BODY));
    if (user) {
      return c.json(user, 201);
    }
    return c.json({ error: "Couldn't create user" }, 404);
  }

  static async update(c: Context) {
    const user = await UsersService.update(
      c.get(validators.VALIDATED_PARAM),
      c.get(validators.VALIDATED_BODY),
    );
    if (user) {
      return c.json(user, 200);
    }
    return c.json({ error: "Couldn't update user" }, 404);
  }

  static async partialUpdate(c: Context) {
    const user = await UsersService.partialUpdate(
      c.get(validators.VALIDATED_PARAM),
      c.get(validators.VALIDATED_BODY),
    );
    if (user) {
      return c.json(user, 200);
    }
    return c.json({ error: "Couldn't patch user" }, 404);
  }

  static async delete(c: Context) {
    const deleted = await UsersService.delete(c.get(validators.VALIDATED_PARAM));
    if (deleted) {
      return c.json({ "Succesfully deleted user: ": deleted }, 200);
    }
    return c.json({ error: "User not found" }, 404);
  }
}

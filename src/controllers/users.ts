import type { Context } from "hono";

import { hashPassword } from "@/utils/argon";
import { UsersService } from "@/services/users";
import { validators } from "@/middlewares/zod-validators";

export class UsersController {
  static async getAll(c: Context) {
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 10);
    const users = await UsersService.getAll(page, limit);
    if (users) {
      return c.json(
        {
          page,
          limit,
          data: users,
        },
        200,
      );
    }
    return c.json({ error: "Couldn't find users" }, 404);
  }

  static async internalGetId(c: Context, id: string) {
    const user = await UsersService.getById(id);
    if (user) {
      return c.json(user, 200);
    }
    return c.json({ error: "User not found" }, 404);
  }

  static async getMe(c: Context) {
    const id = c.get(validators.VALIDATED_ID);
    return UsersController.internalGetId(c, id);
  }

  static async getById(c: Context) {
    const id = c.get(validators.VALIDATED_PARAM);
    return UsersController.internalGetId(c, id);
  }

  static async create(c: Context) {
    const body = c.get(validators.VALIDATED_BODY);
    const passwordHash = await hashPassword(body.password);
    const user = await UsersService.create(body, passwordHash);
    if (user) {
      return c.json(user, 201);
    }
    return c.json({ error: "Couldn't create user" }, 404);
  }
  static async internalPut(c: Context, id: string) {
    const user = await UsersService.update(
      id,
      c.get(validators.VALIDATED_BODY),
    );
    if (user) {
      return c.json(user, 200);
    }
    return c.json({ error: "Couldn't update user" }, 404);
  }
  static async updateMe(c: Context) {
    const id = c.get(validators.VALIDATED_ID);
    return UsersController.internalPut(c, id);
  }

  static async updateId(c: Context) {
    const id = c.get(validators.VALIDATED_PARAM);
    return UsersController.internalPut(c, id);
  }

  static async internalPatch(c: Context, id: string) {
    const user = await UsersService.partialUpdate(
      id,
      c.get(validators.VALIDATED_BODY),
    );
    if (user) {
      return c.json(user, 200);
    }
    return c.json({ error: "Couldn't update user" }, 404);
  }

  static async partialUpdateMe(c: Context) {
    const id = c.get(validators.VALIDATED_ID);
    return UsersController.internalPatch(c, id);
  }

  static async partialUpdateId(c: Context) {
    const id = c.get(validators.VALIDATED_PARAM);
    return UsersController.internalPatch(c, id);
  }

  static async internalDelete(c: Context, id: string) {
    const deleted = await UsersService.delete(id);
    if (deleted) {
      return c.json({ "Succesfully deleted user": deleted }, 200);
    }
    return c.json({ error: "User not found" }, 404);
  }

  static async deleteMe(c: Context) {
    const id = c.get(validators.VALIDATED_ID);
    return UsersController.internalDelete(c, id);
  }

  static async deleteById(c: Context) {
    const id = c.get(validators.VALIDATED_PARAM);
    return UsersController.internalDelete(c, id);
  }
}

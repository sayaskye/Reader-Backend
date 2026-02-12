import type { Context } from "hono";

import { RolesService } from "@/services/roles";
import { validators } from "@/middlewares/zod-validators";

export class RolesController {
  static async getAll(c: Context) {
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 10);
    const roles = await RolesService.getAll(page, limit);
    if (roles) {
      return c.json(
        {
          page,
          limit,
          data: roles,
        },
        200,
      );
    }
    return c.json({ error: "Couldn't find roles" }, 404);
  }

  static async getId(c: Context) {
    const role = await RolesService.getById(c.get(validators.VALIDATED_ID));
    if (role) {
      return c.json(role, 200);
    }
    return c.json({ error: "Role not found" }, 404);
  }

  static async create(c: Context) {
    const body = c.get(validators.VALIDATED_BODY);
    const role = await RolesService.create(body);
    if (role) {
      return c.json(role, 201);
    }
    return c.json({ error: "Couldn't create role" }, 404);
  }

  static async partialUpdate(c: Context) {
    const params = c.get(validators.VALIDATED_PARAMS);
    const role = await RolesService.partialUpdate(
      params.id,
      c.get(validators.VALIDATED_BODY),
    );
    if (role) {
      return c.json(role, 200);
    }
    return c.json({ error: "Couldn't patch role" }, 404);
  }

  static async delete(c: Context) {
    const params = c.get(validators.VALIDATED_PARAMS);
    const deleted = await RolesService.delete(params.id);
    if (deleted) {
      return c.json({ "Succesfully deleted role: ": deleted }, 200);
    }
    return c.json({ error: "Role not found" }, 404);
  }
}

import type { Context } from "hono";

import { UserRolesService } from "@/services/user-roles";
import { validators } from "@/middlewares/zod-validators";

export class UserRolesController {
  static async getAll(c: Context) {
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 10);
    const roles = await UserRolesService.getAll(page, limit);
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
    return c.json({ error: "Couldn't find UserRoles" }, 404);
  }

  static async getId(c: Context) {
    const role = await UserRolesService.getById(c.get(validators.VALIDATED_ID));
    if (role) {
      return c.json(role, 200);
    }
    return c.json({ error: "UserRole not found" }, 404);
  }

  static async create(c: Context) {
    const body = c.get(validators.VALIDATED_BODY);
    const role = await UserRolesService.create(body);
    if (role) {
      return c.json(role, 201);
    }
    return c.json({ error: "Couldn't create UserRole" }, 404);
  }

  static async delete(c: Context) {
    const params = c.get(validators.VALIDATED_PARAMS);
    const deleted = await UserRolesService.delete(params.userId, params.roleId);
    if (deleted) {
      return c.json({ "Succesfully deleted UserRole: ": deleted }, 200);
    }
    return c.json({ error: "UserRole not found" }, 404);
  }
}

import type { HonoContext } from "@/types/hono";

/*HonoContext<{
  Param: paramType
  Body: bodyType
}>*/

export class UsersController {
  static async getAll(c: HonoContext) {
    return c.json({ message: "getAll" }, 200);
  }

  static async getId(c: HonoContext) {
    const id = c.req.param("id");
    return c.json({ id }, 200);
  }

  static async create(c: HonoContext) {
    const body = await c.req.json();
    return c.json({ message: "created", body }, 201);
  }

  static async update(c: HonoContext) {
    const body = await c.req.json();
    return c.json(body, 200);
  }

  static async partialUpdate(c: HonoContext) {
    const body = await c.req.json();
    return c.json(body, 200);
  }

  static async delete(c: HonoContext) {
    const id = c.req.param("id");
    return c.json({ deleted: id }, 200);
  }
}

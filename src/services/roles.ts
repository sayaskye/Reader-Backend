import { eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db/client";
import { roles } from "@/db/schema";

import { RegisterRole, Role } from "@/schemas/roles";

const { ...publicColumns } = getTableColumns(roles);
export class RolesService {
  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return await await db.query.roles.findMany({
      limit: limit,
      offset: offset,
    });
  }

  static async getById(id: string) {
    const result = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    });
    return result ?? null;
  }

  static async create(data: RegisterRole) {
    const result = await db
      .insert(roles)
      .values({ ...data })
      .returning(publicColumns);
    return result[0];
  }

  static async update(id: string, data: Role) {
    const [role] = await db
      .update(roles)
      .set({ ...data })
      .where(eq(roles.id, id))
      .returning(publicColumns);
    return role ?? null;
  }

  static async partialUpdate(id: string, data: Partial<Role>) {
    const [role] = await db
      .update(roles)
      .set({ ...data })
      .where(eq(roles.id, id))
      .returning(publicColumns);
    return role ?? null;
  }

  static async delete(id: string) {
    const [role] = await db
      .delete(roles)
      .where(eq(roles.id, id))
      .returning({ id: roles.id });
    return role ?? null;
  }
}

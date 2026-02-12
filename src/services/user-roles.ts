import { and, eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db/client";
import { userRoles } from "@/db/schema";

import { RegisterUserRole, UserRole } from "@/schemas/user-roles";

const { ...publicColumns } = getTableColumns(userRoles);
export class UserRolesService {
  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return await await db.query.userRoles.findMany({
      limit: limit,
      offset: offset,
    });
  }

  static async getById(id: string) {
    const result = await db.query.userRoles.findFirst({
      where: eq(userRoles.id, id),
    });
    return result ?? null;
  }

  static async create(data: RegisterUserRole) {
    const result = await db
      .insert(userRoles)
      .values({ ...data })
      .returning(publicColumns);
    return result[0];
  }

  static async update(id: string, data: UserRole) {
    const [userRole] = await db
      .update(userRoles)
      .set({ ...data })
      .where(eq(userRoles.id, id))
      .returning(publicColumns);
    return userRole ?? null;
  }

  static async partialUpdate(id: string, data: Partial<UserRole>) {
    const [userRole] = await db
      .update(userRoles)
      .set({ ...data })
      .where(eq(userRoles.id, id))
      .returning(publicColumns);
    return userRole ?? null;
  }

  static async delete(userId: string, roleId: string) {
    const [userRole] = await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
      .returning({ id: userRoles.id });
    return userRole ?? null;
  }
}

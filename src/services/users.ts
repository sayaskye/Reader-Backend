import { eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db/client";
import { users, roles, userRoles } from "@/db/schema";

import { CreateUser, User } from "@/schemas/users";

const { passwordHash, ...publicColumns } = getTableColumns(users);
export class UsersService {
  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return await db.query.users.findMany({
      limit: limit,
      offset: offset,
      columns: { passwordHash: false, deletedAt: false, createdAt: false },
    });
  }

  static async getById(id: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { passwordHash: false, deletedAt: false, createdAt: false },
      with: {
        roles: {
          columns: {},
          with: {
            role: {
              columns: { name: true },
            },
          },
        },
      },
    });
    if (result && result.roles) {
      const cleanedUser = {
        ...result,
        roles: result.roles.map((r) => r.role.name),
      };
      return cleanedUser;
    }
    return null;
  }

  static async create(data: CreateUser, passwordHash: string) {
    return db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          ...data,
          passwordHash,
        })
        .returning(publicColumns);

      const role = await tx.query.roles.findFirst({
        where: eq(roles.name, "User"),
      });
      if (!role) {
        return null;
      }

      await tx.insert(userRoles).values({
        userId: user.id,
        roleId: role.id,
      });
      return user;
    });
  }

  static async update(id: string, data: User) {
    const [user] = await db
      .update(users)
      .set({ ...data })
      .where(eq(users.id, id))
      .returning(publicColumns);
    return user ?? null;
  }

  static async partialUpdate(id: string, data: Partial<User>) {
    const [user] = await db
      .update(users)
      .set({ ...data })
      .where(eq(users.id, id))
      .returning(publicColumns);
    return user ?? null;
  }

  static async delete(id: string) {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return user ?? null;
  }
}

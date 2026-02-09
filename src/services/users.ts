import { eq, getTableColumns } from "drizzle-orm";


import { db } from "@/db/client";
import { users } from "@/db/schema";

import { CreateUser, User } from "@/schemas/users";

const { passwordHash, ...publicColumns } = getTableColumns(users);
export class UsersService {
  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return await await db.query.users.findMany({
      limit: limit,
      offset: offset,
      columns: { passwordHash: false },
    });
  }

  static async getById(id: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { passwordHash: false },
    });
    return result ?? null;
  }

  static async create(data: CreateUser, passwordHash: string) {
    const result = await db
      .insert(users)
      .values({
        ...data,
        passwordHash,
      })
      .returning(publicColumns);
    return result[0];
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

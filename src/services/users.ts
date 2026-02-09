import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";

import { CreateUser, User } from "@/schemas/users";

export class UsersService {
  private static publicColumns = {
    passwordHash: false,
  } as const;

  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return await await db.query.users.findMany({
      limit: limit,
      offset: offset,
      columns: this.publicColumns,
    });
  }

  static async getById(id: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: this.publicColumns,
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
      .returning({
        id: users.id,
        email: users.email,
        nickname: users.nickname,
      });
    return result[0];
  }

  static async update(id: string, data: User) {
    const [user] = await db
      .update(users)
      .set({ ...data })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        nickname: users.nickname,
      });
    return user ?? null;
  }

  static async partialUpdate(id: string, data: Partial<User>) {
    const [user] = await db
      .update(users)
      .set({ ...data })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        nickname: users.nickname,
      });
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

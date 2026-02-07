import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";

import { CreateUser, User } from "@/schemas/users";

export class UsersService {
  static async getAll() {
    return db.select().from(users);
  }

  static async getById(id: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  static async create(data: CreateUser) {
    const result = await db
      .insert(users)
      .values({
        ...data,
      })
      .returning();
    return result[0];
  }

  static async update(id: string, data: User) {
    const [user] = await db
      .update(users)
      .set({ ...data })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  }

  static async partialUpdate(id: string, data: Partial<User>) {
    const [user] = await db
      .update(users)
      .set({ ...data })
      .where(eq(users.id, id))
      .returning();

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

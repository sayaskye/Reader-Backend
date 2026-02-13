import { db } from "@/db/client";
import { userBooks } from "@/db/schema/user-books";
import { and, eq } from "drizzle-orm";

export class UserBooksService {
  static async remove(userId: string, bookId: string) {
    const result = await db
      .delete(userBooks)
      .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)))
      .returning({ id: userBooks.id });

    return result.length > 0;
  }

  static async getByBookId(userId: string, bookId: string) {
    return db.query.userBooks.findFirst({
      where: (ub, { eq, and }) =>
        and(eq(ub.userId, userId), eq(ub.bookId, bookId)),
      with: {
        book: true,
      },
    });
  }

  static async updateProgress(
    userId: string,
    bookId: string,
    lastPosition: number,
  ) {
    const [updated] = await db
      .update(userBooks)
      .set({
        lastPosition,
        lastReadAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)))
      .returning();

    return updated ?? null;
  }

  static async updateStatus(
    userId: string,
    bookId: string,
    status: typeof userBooks.$inferInsert.status,
  ) {
    const [updated] = await db
      .update(userBooks)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)))
      .returning();

    return updated ?? null;
  }

  static async toggleFavorite(userId: string, bookId: string) {
    const existing = await db.query.userBooks.findFirst({
      where: (ub, { eq, and }) =>
        and(eq(ub.userId, userId), eq(ub.bookId, bookId)),
    });

    if (!existing) return null;

    const [updated] = await db
      .update(userBooks)
      .set({
        isFavorite: !existing.isFavorite,
        updatedAt: new Date(),
      })
      .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)))
      .returning();

    return updated;
  }
}

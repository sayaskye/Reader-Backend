import { db } from "@/db/client";
import { userBooks } from "@/db/schema/user-books";
import { and, eq } from "drizzle-orm";

export class UserBooksService {
  static async getMyBooks(userId: string) {
    const results = await db.query.userBooks.findMany({
      where: (ub, { eq }) => eq(ub.userId, userId),
      with: {
        book: {
          columns: {
            deletedAt: false,
            uploadedAt: false,
          },
        },
      },
      orderBy: (ub, { desc }) => desc(ub.dateAddedAt),
    });

    return results;
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

  static async update(
    userBookId: string,
    userId: string,
    data: Partial<typeof userBooks.$inferInsert>,
  ) {
    const [updated] = await db
      .update(userBooks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(userBooks.id, userBookId), eq(userBooks.userId, userId)))
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
  static async remove(userId: string, bookId: string) {
    const result = await db
      .delete(userBooks)
      .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)))
      .returning({ id: userBooks.id });

    return result.length > 0;
  }
}

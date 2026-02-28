import { db } from "@/db/client";
import { userBooks, readingStatusEnum } from "@/db/schema/user-books";
import { books } from "@/db/schema/books";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

type ReadingStatus = (typeof readingStatusEnum.enumValues)[number];
interface FilterParams {
  search?: string;
  status?: ReadingStatus;
  isFavorite?: boolean;
}
export class UserBooksService {
  static async getMyBooks(
    userId: string,
    page = 1,
    limit = 10,
    filters: FilterParams = {},
  ) {
    const offset = (page - 1) * limit;

    const conditions = [eq(userBooks.userId, userId)];
    if (filters.isFavorite) {
      conditions.push(eq(userBooks.isFavorite, true));
    }
    if (filters.status) {
      conditions.push(eq(userBooks.status, filters.status));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(books.title, searchPattern),
          ilike(books.author, searchPattern),
          ilike(books.publisher, searchPattern),
        )!,
      );
    }

    const finalWhere = and(...conditions);

    const [results, totalCountResult] = await Promise.all([
      db
        .select({
          userBook: userBooks,
          book: books,
        })
        .from(userBooks)
        .innerJoin(books, eq(userBooks.bookId, books.id))
        .where(finalWhere)
        .limit(limit)
        .offset(offset)
        .orderBy(
          asc(userBooks.lastReadAt),
          asc(userBooks.updatedAt),
          desc(userBooks.dateAddedAt),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(userBooks)
        .innerJoin(books, eq(userBooks.bookId, books.id))
        .where(finalWhere),
    ]);

    const formattedBooks = results.map(({ userBook, book }) => ({
      ...userBook,
      book,
    }));

    const totalCount = Number(totalCountResult[0].count);
    const hasNextPage = page * limit < totalCount;

    return {
      books: formattedBooks,
      totalCount,
      hasNextPage,
    };
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
    if (data.status === "completed" && !data.finishedAt) {
      data.finishedAt = new Date();
    }
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

import { and, eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db/client";
import { books, userBooks } from "@/db/schema";

import { Book } from "@/schemas/books";

//edit here if you want to extract by default some columns { deletedAt, ...publicColumns }
const { ...publicColumns } = getTableColumns(books);
export class BooksService {
  static async getAll(page = 1, limit = 10, ownerId: string = "") {
    const offset = (page - 1) * limit;
    const filter = ownerId ? eq(books.ownerId, ownerId) : undefined;
    console.log("Entra");
    
    return await db.query.books.findMany({
      limit: limit,
      offset: offset,
      where: filter,
      columns: {
        deletedAt: false,
        uploadedAt: false,
      },
    });
  }

  static async getById(bookId: string, ownerId: string = "") {
    const conditions = [eq(books.id, bookId)];
    if (ownerId) {
      conditions.push(eq(books.ownerId, ownerId));
    }
    const result = await db.query.books.findFirst({
      where: and(...conditions),
      columns: { deletedAt: false, uploadedAt: false },
    });
    return result ?? null;
  }

  static async create(data: Book, userId: string) {
    return db.transaction(async (tx) => {
      const [book] = await tx
        .insert(books)
        .values({ ...data })
        .returning(publicColumns);

      //TODO: continue the transaction for all relations
      return book;
    });
  }

  static async update(id: string, data: Book) {
    const [book] = await db
      .update(books)
      .set({ ...data })
      .where(eq(books.id, id))
      .returning(publicColumns);
    return book ?? null;
  }

  static async partialUpdate(id: string, data: Partial<Book>) {
    const [book] = await db
      .update(books)
      .set({ ...data })
      .where(eq(books.id, id))
      .returning(publicColumns);
    return book ?? null;
  }

  static async delete(id: string) {
    const [book] = await db
      .delete(books)
      .where(eq(books.id, id))
      .returning({ id: books.id });
    return book ?? null;
  }
}

import { eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db/client";
import { books, userBooks } from "@/db/schema";

import { StorageService } from "@/services/storage";
import { Book } from "@/schemas/books";
import { calculateEpubHash } from "@/utils/hash";
import { EpubMetadata } from "@/services/epub";

interface CreateBody {
  bookBuffer: Buffer;
  coverBuffer: Buffer;
  metadata: EpubMetadata;
  ownerId: string;
  toc: Toc;
  originalName: string;
}

export interface TocItem {
  title: string;
  href: string;
  children?: TocItem[];
}

export type Toc = TocItem[];

//edit here if you want to extract by default some columns { deletedAt, ...publicColumns }
const { ...publicColumns } = getTableColumns(books);
export class BooksService {
  static async getAll(page = 1, limit = 10, ownerId: string = "") {
    const offset = (page - 1) * limit;
    // ADMIN MODE
    if (!ownerId) {
      return db.query.books.findMany({
        limit,
        offset,
        columns: {
          deletedAt: false,
          uploadedAt: false,
        },
      });
    }

    const rows = await db.query.userBooks.findMany({
      where: (ub, { eq }) => eq(ub.userId, ownerId),
      limit,
      offset,
      with: {
        book: {
          columns: {
            deletedAt: false,
            uploadedAt: false,
          },
        },
      },
    });

    return rows.map((r) => r.book);
  }

  static async getById(bookId: string, ownerId: string = "") {
    // ADMIN MODE
    if (!ownerId) {
      const book = await db.query.books.findFirst({
        where: (b, { eq }) => eq(b.id, bookId),
        columns: {
          deletedAt: false,
          uploadedAt: false,
        },
      });

      return book ?? null;
    }
    const result = await db.query.userBooks.findFirst({
      where: (ub, { eq, and }) =>
        and(eq(ub.bookId, bookId), eq(ub.userId, ownerId)),
      columns: {},
      with: {
        book: {
          columns: {
            deletedAt: false,
            uploadedAt: false,
          },
        },
      },
    });
    return result?.book ?? null;
  }

  static async create({
    bookBuffer,
    coverBuffer,
    metadata,
    ownerId,
    toc,
    originalName,
  }: CreateBody) {
    const fileSizeInBytes = bookBuffer.length;
    const fileHash = await calculateEpubHash(bookBuffer);

    const existing = await db.query.books.findFirst({
      where: (b, { eq }) => eq(b.fileHash, fileHash),
    });

    if (existing) {
      await db
        .insert(userBooks)
        .values({
          userId: ownerId,
          bookId: existing.id,
          lastPosition: 0,
        })
        .onConflictDoNothing();

      return existing;
    }

    const coverUrl = await StorageService.uploadImage(coverBuffer, {
      fileName: `${crypto.randomUUID()}.webp`,
    });

    const bookUrl = await StorageService.uploadEpub(bookBuffer, {
      fileName: `${crypto.randomUUID()}.epub`,
    });

    const bookData = {
      title: metadata.title,
      author: metadata.author,
      description: metadata.description,
      language: metadata.language,
      publisher: metadata.publisher,
      tableOfContents: toc,
      coverUrl,
      url: bookUrl,
      fileSize: fileSizeInBytes,
      filename: originalName,
      fileHash,
    };

    return db.transaction(async (tx) => {
      const [book] = await tx
        .insert(books)
        .values({ ...bookData })
        .returning(publicColumns);
      await tx.insert(userBooks).values({
        userId: ownerId,
        bookId: book.id,
        lastPosition: 0,
      });
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

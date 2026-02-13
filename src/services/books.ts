import { and, eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db/client";
import { books, userBooks } from "@/db/schema";

import { StorageService } from "@/services/storage";
import { Book } from "@/schemas/books";
import { calculateEpubHash } from "@/utils/hash";
import { EpubMetadata } from "@/services/epub";

interface createBody {
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
    const filter = ownerId ? eq(books.ownerId, ownerId) : undefined;
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

  static async create({
    bookBuffer,
    coverBuffer,
    metadata,
    ownerId,
    toc,
    originalName,
  }: createBody) {
    const fileSizeInBytes = bookBuffer.length;
    const fileHash = await calculateEpubHash(bookBuffer);

    const coverUrl = await StorageService.uploadImage(coverBuffer, {
      fileName: `${crypto.randomUUID()}.webp`,
    });

    const bookUrl = await StorageService.uploadEpub(bookBuffer, {
      fileName: `${crypto.randomUUID()}.epub`,
    });

    const bookData = {
      ownerId,
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

import type { Context } from "hono";

import { EpubService } from "@/services/epub";
import { BooksService } from "@/services/books";
import { validators } from "@/middlewares/zod-validators";

export class BooksController {
  static async TestUpload(c: Context) {
    const body = await c.req.parseBody();
    const file = body.file as File;
    if (!file) return c.json({ error: "Didn't upload any file" }, 400);
    const buffer = Buffer.from(await file.arrayBuffer());
    const { metadata, coverBuffer, mimeType, version, toc } = await EpubService.extractData(buffer);
    if (!metadata)
      return c.json({ error: "Couldn't get metadata from the file" }, 404);
    if (!coverBuffer || !mimeType)
      return c.json({ error: "Couldn't get cover from the file" }, 404);

    return c.json({
      success: true,
      metadata,
      version,
      toc,
      hasCover: !!coverBuffer,
      mimeType
    });
    /* return new Response(new Uint8Array(coverBuffer), {
      headers: {
        "Content-Type": mimeType, 
        "X-Book-Title": metadata.title
      }
    }); */
  }
  static async internalGetBooks(c: Context, ownerId: string = "") {
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 10);
    const books = await BooksService.getAll(page, limit, ownerId);
    if (books) {
      return c.json(
        {
          page,
          limit,
          data: books,
        },
        200,
      );
    }
    return c.json({ error: "Couldn't find books" }, 404);
  }
  static async internalGetId(c: Context, id: string, ownerId: string = "") {
    const book = await BooksService.getById(id, ownerId);
    if (book) {
      return c.json(book, 200);
    }
    return c.json({ error: "Book not found" }, 404);
  }
  static async internalDelete(c: Context, id: string) {
    const deleted = await BooksService.delete(id);
    if (deleted) {
      return c.json({ "Succesfully deleted book": deleted }, 200);
    }
    return c.json({ error: "Book not found" }, 404);
  }
  static async createBook(c: Context) {
    const ownerId = c.get(validators.VALIDATED_ID);
    const body = c.get(validators.VALIDATED_BODY);
    //TODO: validate with zod the file
    //TODO: insert in body urls
    /* const body = await c.req.parseBody();
    const file = body.file as File;
    if (!file) return c.json({ error: "Didn't upload any file" }, 400);
    const buffer = Buffer.from(await file.arrayBuffer());
    const { metadata, coverBuffer, mimeType, version, toc } = await EpubService.extractData(buffer);
    if (!metadata)
      return c.json({ error: "Couldn't get metadata from the file" }, 404);
    if (!coverBuffer || !mimeType)
      return c.json({ error: "Couldn't get cover from the file" }, 404);

    const coverUrl = await StorageService.uploadImage(coverBuffer, {
      fileName: `${crypto.randomUUID()}.jpg`,
      contentType: mimeType
    });

    const bookUrl = await StorageService.uploadEpub(buffer, {
      fileName: `${crypto.randomUUID()}.epub`
    }); 
    */
    const book = await BooksService.create(body, ownerId);
    if (book) {
      return c.json(book, 201);
    }
    return c.json({ error: "Couldn't create this book" }, 404);
  }
  static async getMyBooks(c: Context) {
    const ownerId = c.get(validators.VALIDATED_ID);
    return BooksController.internalGetBooks(c, ownerId);
  }
  static async getMyBookById(c: Context) {
    const params = c.get(validators.VALIDATED_PARAMS);
    const ownerId = c.get(validators.VALIDATED_ID);
    return BooksController.internalGetId(c, params.id, ownerId);
  }
  static async deleteMyBookById(c: Context) {
    const ownerId = c.get(validators.VALIDATED_ID);
    const params = c.get(validators.VALIDATED_PARAMS);
    const book = await BooksService.getById(params.id);
    if (!book)
      return c.json({ error: "Didn't found this book on your library" }, 404);
    const isOwnedBy = ownerId === book.id;
    if (!isOwnedBy) return c.json({ error: "User don't own this book" }, 403);
    return BooksController.internalDelete(c, params.id);
  }
  static async getBooks(c: Context) {
    return BooksController.internalGetBooks(c);
  }
  static async getBookById(c: Context) {
    const params = c.get(validators.VALIDATED_PARAMS);
    return BooksController.internalGetId(c, params.id);
  }
  static async deleteBookById(c: Context) {
    const params = c.get(validators.VALIDATED_PARAMS);
    return BooksController.internalDelete(c, params.id);
  }
}

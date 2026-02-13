import type { Context } from "hono";

import { EpubService } from "@/services/epub";
import { BooksService, Toc } from "@/services/books";
import { validators } from "@/middlewares/zod-validators";

export class BooksController {
  static async TestUpload(c: Context) {
    const body = await c.req.parseBody();
    const file = body.file as File;
    if (!file) return c.json({ error: "Didn't upload any file" }, 400);
    const buffer = Buffer.from(await file.arrayBuffer());
    const { metadata, coverBuffer, mimeType, version, toc } =
      await EpubService.extractData(buffer);
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
      mimeType,
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
  static async createBook(c: Context) {
    const ownerId = c.get(validators.VALIDATED_ID);
    const epub = c.get(validators.VALIDATED_EPUB);
    if (!epub) return c.json({ error: "Couldn't validate the epub file" }, 404);
    const file = epub.file;
    const originalName = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { metadata, coverBuffer, toc } =
      await EpubService.extractData(buffer);
    if (!metadata || !coverBuffer)
      return c.json({ error: "Couldn't get epub file metadata or cover" }, 422);
    /*return c.json({
        bookBuffer: !!buffer,
        coverBuffer: !!coverBuffer,
        metadata,
        toc: toc as Toc,
        originalName,
        ownerId,
      }, 200)*/
    try {
      const book = await BooksService.create({
        bookBuffer: buffer,
        coverBuffer,
        metadata,
        toc: toc as Toc,
        originalName,
        ownerId,
      });
      return c.json(book, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Error while saving the file" }, 500);
    }
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
    return c.json({todo: "TODO:"},200)
  }
  static async deleteUserBookById(c: Context) {
    return c.json({todo: "TODO:"},200)
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
    const deleted = await BooksService.delete(params.id);
    if (deleted) {
      return c.json({ "Succesfully deleted book": deleted }, 200);
    }
    return c.json({ error: "Book not found" }, 404);
  }
}

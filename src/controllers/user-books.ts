import { Context } from "hono";
import { UserBooksService } from "@/services/user-books";
import { validators } from "@/middlewares/zod-validators";

export class UserBooksController {
  static async getMyBooks(c: Context) {
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 10);
    const userId = c.get(validators.VALIDATED_ID);

    const result = await UserBooksService.getMyBooks(userId, page, limit);
    if (result.books) {
      return c.json(
        {
          page,
          limit,
          totalCount: result.totalCount,
          hasNextPage: result.hasNextPage,
          data: result.books,
        },
        200,
      );
    }

    return c.json({ error: "Couldn't find books" }, 404);
  }
  static async getUserBook(c: Context) {
    const userId = c.get(validators.VALIDATED_ID);
    const bookId = c.req.param("id");

    const result = await UserBooksService.getByBookId(userId, bookId);

    if (!result) return c.json({ error: "Not found" }, 404);

    return c.json(result);
  }
  static async update(c: Context) {
    const userId = c.get(validators.VALIDATED_ID);
    const params = c.get(validators.VALIDATED_PARAMS);
    const body = await c.get(validators.VALIDATED_BODY);
    const data = {
      ...body,
      lastReadAt: body.lastReadAt ?? new Date(),
    };
    const updated = await UserBooksService.update(params.id, userId, data);
    if (!updated) {
      return c.json({ message: "User book not found" }, 404);
    }
    return c.json(updated, 200);
  }
  static async toggleFavorite(c: Context) {
    const userId = c.get(validators.VALIDATED_ID);
    const params = c.get(validators.VALIDATED_PARAMS);
    const bookId = params.bookId;
    console.log("USERID:", userId, "BookID:", bookId);

    const updated = await UserBooksService.toggleFavorite(userId, bookId);

    if (!updated) return c.json({ error: "Not found" }, 404);

    return c.json(updated);
  }
  static async internalDeleteBookById(
    c: Context,
    userId: string,
    bookId: string,
  ) {
    const deleted = await UserBooksService.remove(userId, bookId);

    if (!deleted) {
      return c.json({ error: "User book not found" }, 404);
    }

    return c.json({ deleted: true }, 200);
  }
  static async deleteMyBookById(c: Context) {
    const userId = c.get(validators.VALIDATED_ID);
    const params = c.get(validators.VALIDATED_PARAMS);
    return UserBooksController.internalDeleteBookById(c, userId, params.id);
  }
  static async deleteUserBookById(c: Context) {
    const params = c.get(validators.VALIDATED_PARAMS);
    return UserBooksController.internalDeleteBookById(
      c,
      params.userId,
      params.bookId,
    );
  }
}

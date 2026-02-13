import { Context } from "hono";
import { UserBooksService } from "@/services/user-books";
import { validators } from "@/middlewares/zod-validators";

export class UserBooksController {
  static async internalDeleteBookById(c: Context, userId: string, bookId: string){
    const deleted = await UserBooksService.remove(userId, bookId);

    if (!deleted) {
      return c.json({ error: "User book not found" }, 404);
    }

    return c.json({ deleted: true }, 200);
  }
  static async deleteMyBookById(c: Context) {
    const userId = c.get(validators.VALIDATED_ID);
    const params = c.get(validators.VALIDATED_PARAMS);
    return UserBooksController.internalDeleteBookById(c, userId, params.id)
  }

  static async deleteUserBookById(c: Context) {
    const params = c.get(validators.VALIDATED_PARAMS);
    return UserBooksController.internalDeleteBookById(c, params.userId, params.bookId)
  }

  static async getUserBook(c: Context) {
    const userId = c.get(validators.VALIDATED_ID);
    const bookId = c.req.param("id");

    const result = await UserBooksService.getByBookId(userId, bookId);

    if (!result) return c.json({ error: "Not found" }, 404);

    return c.json(result);
  }

  static async updateProgress(c: Context) {
    const userId = c.get(validators.VALIDATED_ID);
    const bookId = c.req.param("id");
    const { lastPosition } = await c.req.json();

    const updated = await UserBooksService.updateProgress(
      userId,
      bookId,
      lastPosition
    );

    if (!updated) return c.json({ error: "Not found" }, 404);

    return c.json(updated);
  }

  static async updateStatus(c: Context) {
    const userId = c.get(validators.VALIDATED_ID);
    const bookId = c.req.param("id");
    const { status } = await c.req.json();

    const updated = await UserBooksService.updateStatus(
      userId,
      bookId,
      status
    );

    if (!updated) return c.json({ error: "Not found" }, 404);

    return c.json(updated);
  }

  static async toggleFavorite(c: Context) {
    const userId = c.get(validators.VALIDATED_ID);
    const bookId = c.req.param("id");

    const updated = await UserBooksService.toggleFavorite(userId, bookId);

    if (!updated) return c.json({ error: "Not found" }, 404);

    return c.json(updated);
  }
}

import type { Context } from "hono";
import { isDatabaseError, mapDbError } from "@/utils/errors";

export const errors = (error: unknown, c: Context) => {
  if (isDatabaseError(error)) {
    const { status, message } = mapDbError(error);
    return c.json(
      { error: `${message} `, details: `${error.cause?.detail}` },
      status,
    );
  }

  return c.json({ error: "Internal server error (╯‵□′)╯︵┻━┻" }, 500);
};

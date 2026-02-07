import { HonoContext } from "@/types/hono";
import { isDatabaseError } from "@/utils/errors";

export const errors = (error: unknown, c: HonoContext) => {
  if (isDatabaseError(error)) {
    if (error.cause?.code === '23505') {
      return c.json({ error: `Conflict: ${error.cause?.detail}` }, 409);
    }
  }

  return c.json({ error: "Internal server error (╯‵□′)╯︵┻━┻" }, 500);
}
import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

import { verify } from "@/utils/jwt";
import { validators } from "@/middlewares/zodValidators";

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "access_token");

  if (!token) {
    return c.text("Unauthorized", 401);
  }

  try {
    const { payload } = await verify(token);
    c.set(validators.VALIDATED_ID, payload.sub);
    await next();
  } catch {
    return c.text("Unauthorized", 401);
  }
}

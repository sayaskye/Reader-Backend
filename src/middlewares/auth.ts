import { Context, Next } from "hono";
import { jwtVerify } from "jose";

import { secret } from "@/utils/jwt";

export async function authMiddleware(c: Context, next: Next) {
  const auth = c.req.header("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return c.text("Unauthorized", 401);
  }

  try {
    const token = auth.slice(7);
    const { payload } = await jwtVerify(token, secret);
    c.set("userId", payload.sub);
    await next();
  } catch {
    return c.text("Unauthorized", 401);
  }
}
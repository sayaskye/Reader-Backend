import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

import { verify } from "@/utils/jwt";
import { validators } from "@/middlewares/zod-validators";

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "access_token");

  if (!token) {
    return c.text("Unauthorized", 401);
  }

  try {
    const { payload } = await verify(token);
    c.set(validators.VALIDATED_ID, payload.sub);
    c.set("roles", payload.roles ?? []);
    await next();
  } catch {
    return c.text("Unauthorized", 401);
  }
}

export async function requireAdmin(c: Context, next: Next) {
  const roles = c.get("roles") as string[];

  if (!roles.includes("Admin")) {
    return c.text("Forbidden", 403);
  }

  await next();
}

export async function refreshAuthMiddleware(c: Context, next: Next) {
  const refreshToken = getCookie(c, "refresh_token");
  if (!refreshToken) return c.text("Refresh Token Missing", 401);
  try {
    const isValid = await verify(refreshToken);
    if (isValid) await next();
  } catch (error) {
    return c.text("Invalid or Expired Refresh Token", 401);
  }
}

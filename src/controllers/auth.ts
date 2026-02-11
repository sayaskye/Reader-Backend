import type { Context } from "hono";
import { getCookie } from "hono/cookie";

import { UsersService } from "@/services/users";
import { AuthService, messages } from "@/services/auth";

import { validators } from "@/middlewares/zod-validators";

import { hashPassword } from "@/utils/argon";
import { clearAuthCookie, setAuthCookie, tokenTypes } from "@/utils/auth-cookies";

export class AuthController {
  static async register(c: Context) {
    const body = c.get(validators.VALIDATED_BODY);
    const passwordHash = await hashPassword(body.password)
    const user = await UsersService.create(body, passwordHash);
    if (user) {
      return c.json(user, 201);
    }
    return c.json({ error: "Couldn't create user" }, 404);
  }

  static async login(c: Context) {
    const body = c.get(validators.VALIDATED_BODY);
    if (body) {
      const result = await AuthService.login(body);
      if (typeof result === "object") {
        setAuthCookie(c,tokenTypes.access, result.accessToken, 60 * 60 * 24)
        setAuthCookie(c,tokenTypes.refresh, result.refreshToken, 60 * 60 * 24 * 30)
        return c.json({ success: true }, 200);
      }
      if (result === messages.invalid || result === messages.unknown) {
        return c.json({ error: result }, 400);
      }
    }
    return c.json({ error: "Invalid data" }, 404);
  }

  static async refresh(c: Context) {
    const refreshToken = getCookie(c, "refresh_token");
    if (!refreshToken) return c.text("Unauthorized", 401);

    const result = await AuthService.refresh(refreshToken);
    if (typeof result === "object") {
      setAuthCookie(c,tokenTypes.access, result.accessToken, 60 * 60 * 24)
      setAuthCookie(c,tokenTypes.refresh, result.refreshToken, 60 * 60 * 24 * 30)
      return c.json({ success: true }, 200);
    }
    return c.text("Unauthorized", 401);
  }

  static async logout(c: Context) {
    const refreshToken = getCookie(c, "refresh_token");

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    clearAuthCookie(c,tokenTypes.access)
    clearAuthCookie(c,tokenTypes.refresh)

    return c.json({ success: true });
  }
}

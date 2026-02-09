import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

import { validators } from "@/middlewares/zodValidators";
import { AuthService, messages } from "@/services/auth";
import { createJWT, createRefreshToken } from "@/utils/jwt";

export class AuthController {
  static async login(c: Context) {
    const body = c.get(validators.VALIDATED_BODY);
    if (body) {
      const result = await AuthService.login(body);
      if (result != messages.invalid && result != messages.unknown) {
        const accessToken = await createJWT(result);
        setCookie(c, "access_token", accessToken, {
          httpOnly: true,
          maxAge: 60 * 60 * 24,
          sameSite: "strict",
          secure: true,
          path: "/",
        });
        const refreshToken = await createRefreshToken(result);
        setCookie(c, "refresh_token", refreshToken, {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 90,
          sameSite: "strict",
          secure: true,
          path: "/",
        });
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

    if (result === messages.invalid || result === messages.unknown) {
      return c.text("Unauthorized", 401);
    }

    setCookie(c, "access_token", result, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      sameSite: "strict",
      secure: true,
      path: "/",
    });

    return c.json({ success: true }, 200);
  }
}

import type { Context } from "hono";
import { setCookie } from "hono/cookie";

import { validators } from "@/middlewares/zodValidators";
import { AuthService, messages } from "@/services/auth";

export class AuthController {
  static async login(c: Context) {
    const body = c.get(validators.VALIDATED_BODY);
    if (body) {
      const result = await AuthService.login(body);
      if (result != messages.invalid && result != messages.unknown) {
        setCookie(c, "access_token", result, {
          httpOnly: true,
          sameSite: "lax",
          secure: false, // true only in HTTPS
          path: "/"
        });
        return c.json({ success: true }, 200);
      }
      if (result === messages.invalid || result === messages.unknown) {
        return c.json({ error: result }, 400);
      }
    }
    return c.json({ error: "Invalid data" }, 404);
  }
  static async refresh(c: Context) {}
}

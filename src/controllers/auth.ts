import type { Context } from "hono";

import { validators } from "@/middlewares/zodValidators";
import { AuthService, messages } from "@/services/auth";

export class AuthController {
  static async login(c: Context) {
    const body = c.get(validators.VALIDATED_BODY);
    if (body) {
      const jwtRes = await AuthService.login(c.get(validators.VALIDATED_BODY));
      if (jwtRes != messages.invalid && jwtRes != messages.unknown) {
        return c.json({ success: jwtRes }, 200);
      }
      if (jwtRes === messages.invalid || jwtRes === messages.unknown) {
        return c.json({ error: jwtRes }, 400);
      }
    }
    return c.json({ error: "User not found" }, 404);
  }
}

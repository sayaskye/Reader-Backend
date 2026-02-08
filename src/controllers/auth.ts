import type { Context } from "hono";

import { validators } from "@/middlewares/zodValidators";
import { AuthService } from "@/services/auth";

export class AuthController {
  static async login(c: Context) {    
    const body = c.get(validators.VALIDATED_BODY)
    if(body){
      const validatedPassword = await AuthService.login(c.get(validators.VALIDATED_BODY))
      
      return c.json(`TODO: JWT  ${validatedPassword}`, 200);
    }
    return c.json({ error: "User not found" }, 404);
  }
}

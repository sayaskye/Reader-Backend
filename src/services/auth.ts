import { eq } from "drizzle-orm";

import { verifyPassword } from "@/utils/argon";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { Login } from "@/schemas/auth";
import { createJWT } from "@/utils/jwt";
import { setCookie } from "hono/cookie";

export enum messages {
  invalid = "Invalid credentials",
  unknown = "Something went wrong",
}

export class AuthService {
  static async login(body: Login) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);
    if (!user) return messages.invalid;

    const verified = await verifyPassword(user.passwordHash, body.password);
    if (!verified) return messages.invalid;

    const accessToken = await createJWT(user.id);
    if (!accessToken) return messages.unknown

    return accessToken;
  }
}

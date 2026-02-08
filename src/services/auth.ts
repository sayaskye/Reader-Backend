import { eq } from "drizzle-orm";

import { createJWT } from "@/utils/jwt";
import { verifyPassword } from "@/utils/argon";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { Login } from "@/schemas/auth";

export enum messages {
  invalid = "Invalid credentials",
  unknown = "Something went wrong"
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

    const token = await createJWT(user.id);
    
    if (token) return token

    return messages.unknown;
  }
}

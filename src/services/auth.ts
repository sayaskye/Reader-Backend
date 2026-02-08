import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { Login } from "@/schemas/auth";

import { verifyPassword } from "@/utils/argon";

export class AuthService {
  static async login(body: Login) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);
    return await verifyPassword(user.passwordHash, body.password);
  }
}

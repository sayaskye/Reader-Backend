import { eq } from "drizzle-orm";

import { verifyPassword } from "@/utils/argon";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { Login } from "@/schemas/auth";
import { createJWT, verify } from "@/utils/jwt";

export enum messages {
  invalid = "Invalid credentials",
  unknown = "Something went wrong",
}

export class AuthService {
  static async login(body: Login) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });
    if (!user) return messages.invalid;

    const verified = await verifyPassword(user.passwordHash, body.password);
    if (!verified) return messages.invalid;
    return user.id;
  }

  static async refresh(refreshToken: string) {
    try {
      const { payload } = await verify(refreshToken);

      if (payload.type !== "refresh") return messages.invalid;

      const accessToken = await createJWT(payload.sub as string);
      if (!accessToken) return messages.unknown;

      return accessToken;
    } catch {
      return messages.invalid;
    }
  }
}

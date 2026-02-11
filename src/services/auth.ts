import { and, eq, isNull } from "drizzle-orm";

import { addDays } from "@/utils/time";
import { hashToken } from "@/utils/hash";
import { verifyPassword } from "@/utils/argon";
import { createJWT, createRefreshToken, verify } from "@/utils/jwt";

import { db } from "@/db/client";
import { refreshTokens, users } from "@/db/schema";
import { Login } from "@/schemas/auth";

export enum messages {
  invalid = "Invalid credentials",
  invalidToken = "Invalid token",
  dbUnknown = "Something failed while connecting DB",
  unknown = "Something went wrong",
}

export class AuthService {
  static async login(body: Login) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, body.email),
      });
      if (!user) return messages.invalid;

      const verified = await verifyPassword(user.passwordHash, body.password);
      if (!verified) return messages.invalid;
      
      const accessToken = await createJWT(user.id);
      const { refreshToken, jti } = await createRefreshToken(user.id);
      
      const refreshTokenHash = hashToken(refreshToken);
      
      const insert = await db.insert(refreshTokens).values({
        id: jti,
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: addDays(new Date(), 30),
      });
      if(!insert) return messages.dbUnknown

      return {
        accessToken,
        refreshToken,
      };
      
    } catch (error) {
      return messages.unknown;
    }
  }

  static async refresh(refreshToken: string) {
    try {
      const { payload } = await verify(refreshToken);

      if (payload.type !== "refresh") return messages.invalid;

      const tokenHash = hashToken(refreshToken);

      const stored = await db.query.refreshTokens.findFirst({
        where: and(
          eq(refreshTokens.id, payload.jti as string),
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.revoked, false),
          isNull(refreshTokens.deletedAt),
        ),
      });

      if (!stored) return messages.invalid;

      if (stored.usedAt) {
        await db
          .update(refreshTokens)
          .set({ revoked: true })
          .where(eq(refreshTokens.userId, stored.userId));

        return messages.invalidToken;
      }

      if (stored.expiresAt < new Date()) return messages.invalidToken;

      const insertNewUsedToken = await db
        .update(refreshTokens)
        .set({ usedAt: new Date() })
        .where(eq(refreshTokens.id, stored.id));
      if(!insertNewUsedToken) return messages.dbUnknown

      const { refreshToken: newRefresh, jti } = await createRefreshToken(
        stored.userId,
      );
      const newHash = hashToken(newRefresh);
      const insertNewToken = await db.insert(refreshTokens).values({
        id: jti,
        userId: stored.userId,
        tokenHash: newHash,
        expiresAt: addDays(new Date(), 30),
      });
      if(!insertNewToken) return messages.dbUnknown

      const newAccess = await createJWT(stored.userId);

      return {
        accessToken: newAccess,
        refreshToken: newRefresh,
      };
    } catch {
      return messages.invalid;
    }
  }

  static async logout(refreshToken: string) {
    try {
      const { payload } = await verify(refreshToken);

      await db
        .update(refreshTokens)
        .set({
          revoked: true,
          deletedAt: new Date(),
        })
        .where(eq(refreshTokens.id, payload.jti as string));

      return true;
    } catch {
      return false;
    }
  }
}

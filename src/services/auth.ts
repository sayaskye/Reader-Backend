import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { Login } from "@/schemas/auth";
import { refreshTokens, users } from "@/db/schema";

import { addDays } from "@/utils/time";
import { hashToken } from "@/utils/hash";
import { verifyPassword } from "@/utils/argon";
import { createJWT, createRefreshToken, verify } from "@/utils/jwt";
import { userWithRolesConfig } from "@/utils/query-configs";

export enum messages {
  invalid = "Invalid credentials",
  invalidToken = "Invalid token",
  dbUnknown = "Something failed while connecting DB",
  unknown = "Something went wrong",
}


export class AuthService {
  static async findUser(whereClause: any) {
    const result = await db.query.users.findFirst({
      where: whereClause,
      ...userWithRolesConfig,
    });

    if (!result) return null;
    return {
      ...result,
      roles: result.roles.map((r) => r.role.name),
    };
  }

  static async getUserById(userId: string) {
    return AuthService.findUser(eq(users.id, userId));
  }

  static async getUserByEmail(email: string) {
    return AuthService.findUser(eq(users.email, email));
  }

  static async login(body: Login) {
    try {
      const user = await AuthService.getUserByEmail(body.email);
      if (!user) return messages.invalid;

      const verified = await verifyPassword(user.passwordHash, body.password);
      if (!verified) return messages.invalid;

      const accessToken = await createJWT(user.id, user.roles);
      const { refreshToken, jti } = await createRefreshToken(user.id);

      const refreshTokenHash = await hashToken(refreshToken);

      const insert = await db.insert(refreshTokens).values({
        id: jti,
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: addDays(new Date(), 30),
      });

      if (!insert) return messages.dbUnknown;

      return {
        accessToken,
        refreshToken,
      };
    } catch {
      return messages.unknown;
    }
  }

  static async refresh(refreshToken: string) {
    try {
      const { payload } = await verify(refreshToken);
      if (payload.type !== "refresh") return messages.invalid;

      const tokenHash = await hashToken(refreshToken);

      return await db.transaction(async (tx) => {
        const stored = await tx.query.refreshTokens.findFirst({
          where: and(
            eq(refreshTokens.id, payload.jti as string),
            eq(refreshTokens.tokenHash, tokenHash),
            eq(refreshTokens.revoked, false),
            isNull(refreshTokens.deletedAt),
          ),
        });

        if (!stored) return messages.invalid;

        if (stored.usedAt) {
          await tx
            .update(refreshTokens)
            .set({ revoked: true })
            .where(eq(refreshTokens.userId, stored.userId));

          return messages.invalidToken;
        }

        if (stored.expiresAt < new Date()) return messages.invalidToken;

        await tx
          .update(refreshTokens)
          .set({ usedAt: new Date() })
          .where(eq(refreshTokens.id, stored.id));

        const { refreshToken: newRefresh, jti } = await createRefreshToken(
          stored.userId,
        );

        const newHash = await hashToken(newRefresh);

        await tx.insert(refreshTokens).values({
          id: jti,
          userId: stored.userId,
          tokenHash: newHash,
          expiresAt: addDays(new Date(), 30),
        });

        const user = await AuthService.getUserById(stored.userId);
        if (!user) return messages.invalid;

        const newAccess = await createJWT(stored.userId, user.roles);

        return {
          accessToken: newAccess,
          refreshToken: newRefresh,
        };
      });
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

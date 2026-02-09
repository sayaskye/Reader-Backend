import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  tokenHash: text("token_hash").notNull(),

  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),

  revoked: boolean("revoked").default(false).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

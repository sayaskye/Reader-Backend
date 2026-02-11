import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { userRoles } from "@/db/schema/user-roles";
import { books } from "@/db/schema/books";
import { userBooks } from "@/db/schema/user-books";
import { sharedBooks } from "@/db/schema/shared-books";
import { refreshTokens } from "@/db/schema/refresh-tokens";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    nickname: text("nickname").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    uniqueIndex("users_nickname_unique").on(t.nickname),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  roles: many(userRoles),
  books: many(books),
  userBooks: many(userBooks),
  sharedWith: many(sharedBooks, { relationName: "sharedWith" }),
  sharedBy: many(sharedBooks, { relationName: "sharedBy" }),
}));

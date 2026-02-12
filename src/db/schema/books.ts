import {
  pgTable,
  uuid,
  text,
  timestamp,
  bigint,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "@/db/schema/users";
import { userBooks } from "@/db/schema/user-books";
import { sharedBooks } from "@/db/schema/shared-books";

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  coverUrl: text("cover_url"),
  title: text("title").notNull(),
  author: text("author"),
  language: text("language"),
  publisher: text("publisher"),
  description: text("description"),
  tableOfContents: jsonb("table_of_contents").$type<string[]>(),
  fileSize: bigint("file_size", { mode: "bigint" }).notNull(),
  filename: text("filename").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const booksRelations = relations(books, ({ one, many }) => ({
  owner: one(users, {
    fields: [books.ownerId],
    references: [users.id],
  }),
  userBooks: many(userBooks),
  sharedBooks: many(sharedBooks),
}));

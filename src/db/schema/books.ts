import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { userBooks } from "@/db/schema/user-books";
import { sharedBooks } from "@/db/schema/shared-books";
import { Toc } from "@/services/books";

export const books = pgTable(
  "books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    url: text("url").notNull(),
    coverUrl: text("cover_url"),
    title: text("title").notNull(),
    author: text("author"),
    language: text("language"),
    publisher: text("publisher"),
    description: text("description"),
    tableOfContents: jsonb("table_of_contents")
      .$type<Toc>()
      .notNull()
      .default([]),
    fileSize: integer("file_size").notNull(),
    filename: text("filename").notNull(),
    fileHash: text("file_hash").notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("books_hash_unique").on(t.fileHash),
  ],
);

export const booksRelations = relations(books, ({ many }) => ({
  userBooks: many(userBooks),
  sharedBooks: many(sharedBooks),
}));

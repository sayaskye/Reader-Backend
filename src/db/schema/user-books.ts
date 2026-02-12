import {
  pgTable,
  uuid,
  timestamp,
  integer,
  uniqueIndex,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "@/db/schema/users";
import { books } from "@/db/schema/books";

export const readingStatusEnum = pgEnum("reading_status", [
  "to-read",
  "reading",
  "completed",
  "on-hold",
]);

export const userBooks = pgTable(
  "user_books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    status: readingStatusEnum("status").default("to-read").notNull(),
    lastPosition: integer("last_position").default(0),
    totalPages: integer("total_pages"),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    dateAddedAt: timestamp("date_added_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("user_books_unique").on(t.userId, t.bookId)],
);

export const userBooksRelations = relations(userBooks, ({ one }) => ({
  user: one(users, {
    fields: [userBooks.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [userBooks.bookId],
    references: [books.id],
  }),
}));

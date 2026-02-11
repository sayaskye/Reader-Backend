import {
  pgTable,
  uuid,
  timestamp,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "@/db/schema/users";
import { books } from "@/db/schema/books";

export const sharedPermissionEnum = pgEnum("shared_permission", [
  "read",
  "edit",
]);

export const sharedBooks = pgTable(
  "shared_books",
  {
    sharedWithId: uuid("shared_with_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    sharedById: uuid("shared_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    permission: sharedPermissionEnum("permission").notNull(),

    sharedAt: timestamp("shared_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("shared_books_unique").on(t.sharedWithId, t.bookId)],
);

export const sharedBooksRelations = relations(sharedBooks, ({ one }) => ({
  book: one(books, {
    fields: [sharedBooks.bookId],
    references: [books.id],
  }),
  sharedWith: one(users, {
    fields: [sharedBooks.sharedWithId],
    references: [users.id],
    relationName: "sharedWith",
  }),
  sharedBy: one(users, {
    fields: [sharedBooks.sharedById],
    references: [users.id],
    relationName: "sharedBy",
  }),
}));

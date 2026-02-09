import {
  pgTable,
  uuid,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";
import { books } from "@/db/schema/books";

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

    lastPosition: integer("last_position"),

    dateAddedAt: timestamp("date_added_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),

    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("user_books_unique").on(t.userId, t.bookId),
  ]
);

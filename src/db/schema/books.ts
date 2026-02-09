import {
  pgTable,
  uuid,
  text,
  timestamp,
  bigint,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";

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

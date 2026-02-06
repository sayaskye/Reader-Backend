import { pgTable, uuid, text, date, timestamp } from "drizzle-orm/pg-core";

//bunx drizzle-kit generate
//bunx drizzle-kit push

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  lastName: text("last_name").notNull(),
  birthDate: date("birth_date").notNull(),
  gender: text("gender").notNull(),
  email: text("email").notNull(),
  nickName: text("nickname").notNull(),
  country: text("country").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

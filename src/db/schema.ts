import { pgTable, uuid, text, date, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

//bunx drizzle-kit generate
//bunx drizzle-kit push

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  lastName: text("last_name").notNull(),
  birthDate: text("birth_date").notNull(),
  gender: text("gender").notNull(),
  email: text("email").notNull(),
  nickname: text("nickname").notNull(),
  country: text("country").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
    nicknameUnique: uniqueIndex("users_nickname_unique").on(t.nickname),
  })
);
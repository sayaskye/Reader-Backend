import { pgTable, uuid, text, date, timestamp } from "drizzle-orm/pg-core";

//bunx drizzle-kit generate
//bunx drizzle-kit push

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  nickname: text("nickname").notNull(),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  fechaNacimiento: date("fecha_nacimiento").notNull(),
  correo: text("correo").notNull(),
  genero: text("genero").notNull(),
  pais: text("pais").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

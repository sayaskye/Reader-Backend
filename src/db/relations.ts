import { relations } from "drizzle-orm";

import { users } from "@/db/schema/users";
import { roles } from "@/db/schema/roles";
import { userRoles } from "@/db/schema/user-roles";
import { books } from "@/db/schema/books";
import { userBooks } from "@/db/schema/user-books";
import { sharedBooks } from "@/db/schema/shared-books";
import { refreshTokens } from "@/db/schema/refresh-tokens";

/* USERS */

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  roles: many(userRoles),
  books: many(books),
  userBooks: many(userBooks),
  sharedWith: many(sharedBooks, { relationName: "sharedWith" }),
  sharedBy: many(sharedBooks, { relationName: "sharedBy" }),
}));

/* ROLES */

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(userRoles),
}));

/* USER_ROLES */

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

/* BOOKS */

export const booksRelations = relations(books, ({ one, many }) => ({
  owner: one(users, {
    fields: [books.ownerId],
    references: [users.id],
  }),
  userBooks: many(userBooks),
  sharedBooks: many(sharedBooks),
}));

/* USER_BOOKS */

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

/* SHARED_BOOKS */

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

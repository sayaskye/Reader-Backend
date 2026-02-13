import { Hono } from "hono";
import { logger } from "hono/logger";

import { auth } from "@/routes/auth";
import { users } from "@/routes/users";
import { books } from "@/routes/books";
import { roles } from "@/routes/roles";
import { userRoles } from "@/routes/user-roles";
import { userBooks } from "@/routes/user-books";
import { health } from "@/routes/health";

import { errors } from "@/middlewares/errors";

const app = new Hono().basePath("/api/");

app.use(logger());

app.onError(errors);

app.route("/health", health);
app.route("/users", users);
app.route("/books", books);
app.route("/auth", auth);
app.route("/roles", roles);
app.route("/user-roles", userRoles);
app.route("/user-books", userBooks);

export default {
  port: process.env.PORT ?? 3000,
  fetch: app.fetch,
};

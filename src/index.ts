import { Hono } from "hono";
import { logger } from "hono/logger";

import { auth } from "@/routes/auth";
import { users } from "@/routes/users";
import { roles } from "@/routes/roles";
import { health } from "@/routes/health";

import { errors } from "@/middlewares/errors";
import { authMiddleware } from "@/middlewares/auth";
import { validators } from "@/middlewares/zod-validators";

const app = new Hono().basePath("/api/");

app.use(logger());

app.onError(errors);

app.route("/health", health);
app.route("/users", users);
app.route("/auth", auth);
app.route("/roles", roles);

export default {
  port: process.env.PORT ?? 3000,
  fetch: app.fetch,
};

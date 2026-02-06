import { Hono } from "hono";
import { logger } from "hono/logger";

import { users } from "./routes/users";
import { health } from "./routes/health";

const app = new Hono().basePath("/api/");

app.use(logger());

app.route("/health", health);
app.route("/users", users);

export default {
  port: process.env.PORT ?? 3000,
  fetch: app.fetch,
};

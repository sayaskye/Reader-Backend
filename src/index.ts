import { Hono } from "hono";
import { logger } from "hono/logger";

import { auth } from "@/routes/auth";
import { users } from "@/routes/users";
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

//TODO: Delete this
//@ts-ignore
app.get("/", authMiddleware, (c) => c.json({message: 'Protected route!', user: c.get(validators.VALIDATED_ID)}, 200))

export default {
  port: process.env.PORT ?? 3000,
  fetch: app.fetch,
};

import { Hono } from "hono";

import { AuthController } from "@/controllers/auth";

import { validateLogin } from "@/schemas/auth";
import { validateBody } from "@/middlewares/zod-validators";

export const auth = new Hono();

auth.post("/login", validateBody(validateLogin), AuthController.login);
auth.post("/refresh", AuthController.refresh);
auth.post("/logout", AuthController.logout)

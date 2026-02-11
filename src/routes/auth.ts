import { Hono } from "hono";

import { AuthController } from "@/controllers/auth";

import { validateLogin, validateRegister } from "@/schemas/auth";
import { validateBody } from "@/middlewares/zod-validators";
import { authMiddleware } from "@/middlewares/auth";

export const auth = new Hono();

auth.post("/register", validateBody(validateRegister), AuthController.register)
auth.post("/login", validateBody(validateLogin), AuthController.login);
auth.post("/refresh", authMiddleware, AuthController.refresh);
auth.post("/logout", AuthController.logout)

import { Hono } from "hono";

import { AuthController } from "@/controllers/auth";

import { validateLogin } from "@/schemas/auth";
import { validateBody } from "@/middlewares/zodValidators";

export const auth = new Hono();

auth.post("/login", validateBody(validateLogin), AuthController.login);
auth.post("/refresh", AuthController.refresh);

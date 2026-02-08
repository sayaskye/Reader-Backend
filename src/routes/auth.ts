import { Hono } from "hono";

import { AuthController } from "@/controllers/auth";

import { validateLogin } from "@/schemas/auth";
import { validate } from "@/middlewares/zodValidators";

export const auth = new Hono();

auth.post("/login", validate(validateLogin), AuthController.login);

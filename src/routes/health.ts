import { Hono } from "hono";

import { HealthController } from "@/controllers/health";

export const health = new Hono();

health.get("/", HealthController.main);

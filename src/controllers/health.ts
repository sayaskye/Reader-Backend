import type { Context } from "hono";
import { db } from "@/db/client";

export class HealthController {
  static async main(c: Context) {
    const start = performance.now();

    const checks = {
      database: "ok",
      memory: "ok",
    };

    // DB check
    try {
      await db.execute("SELECT 1");
    } catch {
      checks.database = "error";
    }

    // Memory check
    const mem = process.memoryUsage();
    const usedMB = mem.heapUsed / 1024 / 1024;

    if (usedMB > 500) {
      checks.memory = "warning";
    }

    const duration = performance.now() - start;

    const status =
      Object.values(checks).includes("error")
        ? "error"
        : "ok";

    return c.json(
      {
        status,
        uptime: process.uptime(),
        checks,
        memory: mem,
        responseTimeMs: Math.round(duration),
        timestamp: Date.now(),
      },
      status === "ok" ? 200 : 503
    );
  }
}

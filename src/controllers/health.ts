import type { Context } from "hono";

export class HealthController {
  static async main(c: Context) {
    return c.json({
      status: "ok",
      uptime: process.uptime(),
      pid: process.pid,
      memory: process.memoryUsage(),
      timestamp: Date.now(),
    });
  }
}

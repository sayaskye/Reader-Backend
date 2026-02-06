import type { HonoContext } from "@/types/hono";

export class HealthController {
  static async main(c: HonoContext) {
    return c.json({
      status: "ok",
      uptime: process.uptime(),
      pid: process.pid,
      memory: process.memoryUsage(),
      timestamp: Date.now(),
    });
  }
}

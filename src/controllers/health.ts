import type { Context } from "hono";
import { loopMonitor } from "@/utils/loop-monitor";
import { db } from "@/db/client";

export class HealthController {
  static async main(c: Context) {
    const start = performance.now();

    let dbStatus: "ok" | "error" = "ok";
    let memoryStatus: "ok" | "warning" | "error" = "ok";
    let loopStatus: "ok" | "warning" | "error" = "ok";

    // ---------- DB CHECK ----------
    try {
      await db.execute("SELECT 1");
    } catch {
      dbStatus = "error";
    }

    // ---------- MEMORY CHECK ----------
    const mem = process.memoryUsage();
    const heapMB = mem.heapUsed / 1024 / 1024;

    if (heapMB > 500) memoryStatus = "warning";
    if (heapMB > 800) memoryStatus = "error";

    // ---------- EVENT LOOP CHECK ----------
    const lagMs = Math.round(loopMonitor.mean / 1e6);

    if (lagMs > 200) loopStatus = "warning";
    if (lagMs > 500) loopStatus = "error";

    loopMonitor.reset();

    // ---------- GLOBAL STATUS ----------
    const hasError =
      dbStatus === "error" ||
      memoryStatus === "error" ||
      loopStatus === "error";

    const status = hasError ? "error" : "ok";

    const duration = performance.now() - start;

    return c.json(
      {
        status,
        uptime: process.uptime(),

        checks: {
          database: dbStatus,
          memory: memoryStatus,
          eventLoop: loopStatus,
        },

        metrics: {
          memoryMB: Math.round(heapMB),
          eventLoopLagMs: lagMs,
          responseTimeMs: Math.round(duration),
        },

        timestamp: Date.now(),
      },
      status === "ok" ? 200 : 503,
    );
  }
}

import { Context, Next } from "hono";
import { acquireSlot, releaseSlot } from "@/utils/concurrency-guard";

export async function uploadGuard(c: Context, next: Next) {
  if (!acquireSlot()) {
    return c.json({ error: "Server busy processing uploads" }, 503);
  }
  try {
    await next();
  } finally {
    releaseSlot();
  }
}

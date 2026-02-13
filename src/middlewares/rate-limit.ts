import { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";

import { validators } from "@/middlewares/zod-validators";

export const authLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 5,
  handler: (c) =>
    c.json({ error: "Upload limit reached. Try again in 1 minute." }, 429),
  keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "anon",
});

export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 100,
  handler: (c: Context) =>
    c.json({ error: "Upload limit reached. Try again in 1 minute." }, 429),
  keyGenerator: (c: Context) => {
    const userId = c.get(validators.VALIDATED_ID);
    return userId ?? c.req.header("x-forwarded-for") ?? "anon";
  },
});

export const uploadLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 1,
  handler: (c: Context) =>
    c.json({ error: "Upload limit reached. Try again in 1 minute." }, 429),
  keyGenerator: (c: Context) => {
    const userId = c.get(validators.VALIDATED_ID);
    return userId ?? c.req.header("x-forwarded-for")  ?? "anon";
  },
});

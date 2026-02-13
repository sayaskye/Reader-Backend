import type { Context, Next } from "hono";

export enum validators {
  VALIDATED_PARAMS = "validatedParam",
  VALIDATED_BODY = "validatedBody",
  VALIDATED_EPUB = "validatedEPUB",
  VALIDATED_ID = "userId",
}

export const validateBody = (fn: any) => async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    const r = fn(body);

    if (r.success) {
      c.set(validators.VALIDATED_BODY, r.data);
      return await next();
    }

    const flatErrors = r.error.flatten();
    return c.json(
      {
        error: "Validation failed",
        details: flatErrors.fieldErrors,
      },
      400,
    );
  } catch (e) {
    return c.json({ error: "Invalid JSON format" }, 400);
  }
};

export const validateParam =
  (fn: any, key: string) => async (c: Context, next: Next) => {
    const value = c.req.param(key);
    const r = fn(value);

    if (r.success) {
      const data = r.data as Record<string, any>;
      const existing = c.get(validators.VALIDATED_PARAMS) ?? {};
      c.set(validators.VALIDATED_PARAMS, {
        ...existing,
        [key]: data,
      });
      return await next();
    }

    return c.json(
      {
        error: `Invalid parameter: ${key}`,
        details: r.error ? r.error.flatten().fieldErrors : null,
      },
      400,
    );
  };

export const validateEPUB = (fn: any) => async (c: Context, next: Next) => {
  try {
    const body = await c.req.parseBody();
    const r = fn(body);

    if (r.success) {
      c.set(validators.VALIDATED_EPUB, r.data);
      return await next();
    }

    const flatErrors = r.error.flatten();
    return c.json(
      {
        error: "Validation failed",
        details: flatErrors.fieldErrors,
      },
      400,
    );
  } catch (e) {
    return c.json({ error: "Invalid EPUB" }, 400);
  }
};

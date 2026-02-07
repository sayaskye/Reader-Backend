import type { Context, Next } from "hono";

export enum validators {
  VALIDATED_PARAM = "validatedParam",
  VALIDATED_BODY = "validatedBody",
}

export const validate =
  (fn: any, target: "param" | "json" = "json", key = "id") =>
  async (c: Context, next: Next) => {
    const value =
      target === "param" ? { [key]: c.req.param(key) } : await c.req.json();

    const r = fn(value);

    if (r.success) {
      if (target === "param") c.set(validators.VALIDATED_PARAM, r.data?.[key]);
      else c.set(validators.VALIDATED_BODY, r.data);
      return next();
    }

    if (!r.success) {
      const flatErrors = r.error.flatten();
      console.log(flatErrors);
      return c.json(
        {
          error: "Validation failed",
          details: flatErrors.fieldErrors,
          formErrors: flatErrors.formErrors,
        },
        400,
      );
    }
    //If for some reason... just in case
    return c.json({ error: "Data validation failed" }, 400);
  };

import type { Context, Next } from "hono";

export enum validators {
  VALIDATED_PARAM = "validatedParam",
  VALIDATED_BODY = "validatedBody",
}

/**
 * Generic middleware to validate data with zod
 * @param {function} fn - Generic function from zod with safe parse.
 * @param {string} target - Indicates what needs to validate, a parameter or body(Json).
 * @param {string} key - Indicates what parameters is going to validate.
 * @returns {void || object} The result of validation, success or error.
 */
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

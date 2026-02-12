import * as z from "zod";

export const validateUUID = (value: string) => {
  return z.uuid().safeParse(value);
};
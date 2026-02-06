import * as z from "zod";

const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  lastName: z.string(),
  email: z.email(),
  nickname: z.string(),
  birthDate: z.string(),
  gender: z.string(),
  country: z.string(),
});

export function validateUser(input: User) {
  return UserSchema.safeParse(input);
}

export function validatePartialUser(input: User) {
  return UserSchema.partial().safeParse(input);
}

export type User = z.infer<typeof UserSchema>;
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

export const UserIdParamSchema = z.object({
  id: z.uuid(),
});

export const CreateUserSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.email(),
  nickname: z.string(),
  birthDate: z.string(),
  gender: z.string(),
  country: z.string(),
});

export const EditUserSchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  email: z.email().optional(),
  nickname: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type EditUser = z.infer<typeof EditUserSchema>;

export const validateUUID = (input: UserIdParam) => {
  return UserIdParamSchema.safeParse(input);
}

export const validateUser = (input: CreateUser) => {
  return CreateUserSchema.safeParse(input);
}

export const validatePartialUser = (input: EditUser) => {
  return CreateUserSchema.partial().safeParse(input);
}

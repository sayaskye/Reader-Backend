import * as z from "zod";

const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  nickname: z.string(),
  passwordHash: z.string(),
});

export const CreateUserSchema = z.object({
  email: z.email(),
  nickname: z.string(),
  password: z.string().min(8),
});

export const EditUserSchema = z.object({
  email: z.email(),
  nickname: z.string(),
  password: z.string().min(8),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type EditUser = z.infer<typeof EditUserSchema>;

export const validateUser = (input: CreateUser) => {
  return CreateUserSchema.safeParse(input);
};

export const validatePartialUser = (input: EditUser) => {
  return CreateUserSchema.partial().safeParse(input);
};

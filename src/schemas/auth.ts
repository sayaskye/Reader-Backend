import * as z from "zod";

const RegisterSchema = z.object({
  nickname: z.string(),
  email: z.email(),
  password: z.string(),
});

const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;

export const validateRegister = (input: Register) => {
  return RegisterSchema.safeParse(input);
};

export const validateLogin = (input: Login) => {
  return LoginSchema.safeParse(input);
};

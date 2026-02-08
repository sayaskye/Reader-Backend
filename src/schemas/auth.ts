import * as z from "zod";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type Login = z.infer<typeof LoginSchema>;

export const validateLogin = (input: Login) => {
  return LoginSchema.safeParse(input);
};

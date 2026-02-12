import * as z from "zod";

const UserRoleSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  roleId: z.uuid(),
});

const RegisterUserRoleSchema = z.object({
  userId: z.uuid(),
  roleId: z.uuid(),
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type RegisterUserRole = z.infer<typeof RegisterUserRoleSchema>;

export const validateUserRole = (input: UserRole) => {
  return UserRoleSchema.safeParse(input);
};

export const validateRegisterUserRole = (input: RegisterUserRole) => {
  return RegisterUserRoleSchema.partial().safeParse(input);
};

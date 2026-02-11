import * as z from "zod";

const RoleSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

const RegisterRoleSchema = z.object({
  name: z.string(),
});

export type Role = z.infer<typeof RoleSchema>;
export type RegisterRole = z.infer<typeof RegisterRoleSchema>;

export const validateRole = (input: Role) => {
  return RoleSchema.safeParse(input);
};

export const validateRegisterRole = (input: RegisterRole) => {
  return RegisterRoleSchema.partial().safeParse(input);
};

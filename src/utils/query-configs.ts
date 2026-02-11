export const userHashExcludedConfig = {
  columns: { passwordHash: false, deletedAt: false, createdAt: false }
} as const;

export const userWithRolesConfig = {
  with: {
    roles: {
      columns: {},
      with: {
        role: {
          columns: { name: true },
        },
      },
    },
  },
} as const;
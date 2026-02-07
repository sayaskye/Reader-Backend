interface PostgresError extends Error {
  code?: string;
  detail?: string;
  table?: string;
}

interface DrizzleError extends Error {
  cause: PostgresError;
}

const PG_ERRORS = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
} as const;

export function isDatabaseError(err: unknown): err is DrizzleError {
  return (
    err instanceof Error &&
    'cause' in err &&
    typeof (err as any).cause?.code === 'string'
  );
}

export const mapDbError = (err: unknown) => {
  if (isDatabaseError(err)) {
    switch (err.cause.code) {
      case PG_ERRORS.UNIQUE_VIOLATION:
        return { status: 409, message: "The reagistry already exist." };
      case PG_ERRORS.FOREIGN_KEY_VIOLATION:
        return { status: 400, message: "Not a valid reference." };
      case PG_ERRORS.NOT_NULL_VIOLATION:
        return { status: 400, message: "Null not allowed." };
      default:
        return { status: 500, message: "Internal Server Error" };
    }
  }
  return { status: 500, message: "Internal Server Error" };
};
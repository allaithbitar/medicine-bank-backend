export const ERROR_CODES = {
  INVALID_OTP: "INVALID_OTP",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  WRONG_PASSWORD: "WRONG_PASSWORD",
  INVALID_TOKEN: "INVALID_TOKEN",
  NO_TOKEN: "NO_TOKEN",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  FORBIDDEN_ACTION: "FORBIDDEN_ACTION",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  ENTITY_NOT_FOUND: "ENTITY_NOT_FOUND",
} as const;

export class BadRequestError extends Error {
  code = 400 as const;
  constructor(MESSAGE_CODE: string) {
    super(MESSAGE_CODE);
  }
}

export class UnauthorizedError extends Error {
  code = 401 as const;
  constructor(MESSAGE_CODE: string) {
    super(MESSAGE_CODE);
  }
}

export class ForbiddenError extends Error {
  code = 403 as const;
  constructor(MESSAGE_CODE: string) {
    super(MESSAGE_CODE);
  }
}

export class NotFoundError extends Error {
  code = 404 as const;
  constructor(MESSAGE_CODE: string) {
    super(MESSAGE_CODE);
  }
}

export class ServerError extends Error {
  code = 500 as const;
  constructor(MESSAGE_CODE: string) {
    super(MESSAGE_CODE);
  }
}

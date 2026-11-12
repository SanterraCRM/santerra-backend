export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, "FORBIDDEN");
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, "RESOURCE_NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT") {
    super(message, 409, code);
  }
}

// Exclusão bloqueada porque outro registro ainda usa este. A mensagem diz onde
// (ex.: "Este potencial está em uso por 3 produtores."); duplicidade continua CONFLICT.
export class ResourceInUseError extends ConflictError {
  constructor(message: string) {
    super(message, "RESOURCE_IN_USE");
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message: string) {
    super(message, 413, "PAYLOAD_TOO_LARGE");
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string) {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string) {
    super(message, 503, "SERVICE_UNAVAILABLE");
  }
}

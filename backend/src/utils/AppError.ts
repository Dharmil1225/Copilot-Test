export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BAD_REQUEST = 'BAD_REQUEST',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400, ErrorCode.BAD_REQUEST);
  }

  static validationError(message: string): AppError {
    return new AppError(message, 400, ErrorCode.VALIDATION_ERROR);
  }

  static notFound(message: string): AppError {
    return new AppError(message, 404, ErrorCode.NOT_FOUND);
  }

  static internal(message = 'Internal Server Error'): AppError {
    return new AppError(message, 500, ErrorCode.INTERNAL_ERROR, false);
  }
}

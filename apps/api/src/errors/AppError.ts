import { ERROR_CODES, ERROR_HTTP_STATUS, type ErrorCode } from '@unimobiliare/shared';

/**
 * Base application error class
 * All custom errors should extend this
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: ErrorCode;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        code: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
        isOperational = true
    ) {
        super(message);
        this.code = code;
        this.statusCode = ERROR_HTTP_STATUS[code];
        this.isOperational = isOperational;

        // Maintains proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Resource not found error
 */
export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        const message = id
            ? `${resource} with id '${id}' not found`
            : `${resource} not found`;
        super(message, ERROR_CODES.NOT_FOUND);
    }
}

/**
 * Validation error with field-level details
 */
export class ValidationError extends AppError {
    public readonly errors: Array<{ field: string; message: string }>;

    constructor(errors: Array<{ field: string; message: string }>) {
        super('Validation failed', ERROR_CODES.VALIDATION_ERROR);
        this.errors = errors;
    }
}

/**
 * Authentication error
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, ERROR_CODES.UNAUTHORIZED);
    }
}

/**
 * Authorization error
 */
export class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super(message, ERROR_CODES.FORBIDDEN);
    }
}

/**
 * Conflict error (e.g., duplicate entry)
 */
export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, ERROR_CODES.CONFLICT);
    }
}

/**
 * Bad request error
 */
export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, ERROR_CODES.BAD_REQUEST);
    }
}

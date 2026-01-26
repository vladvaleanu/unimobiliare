import type { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/index.js';
import { ERROR_CODES } from '@unimobiliare/shared';
import { logger } from '../utils/logger.js';

/**
 * Global error handling middleware
 * STRICT: All errors pass through here for consistent response format
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void {
    // Log error
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Operational errors (expected) - safe to send to client
    if (err instanceof AppError && err.isOperational) {
        const response: {
            success: false;
            error: {
                code: string;
                message: string;
                errors?: Array<{ field: string; message: string }>;
            };
        } = {
            success: false,
            error: {
                code: err.code,
                message: err.message,
            },
        };

        // Add field errors for validation errors
        if (err instanceof ValidationError) {
            response.error.errors = err.errors;
        }

        res.status(err.statusCode).json(response);
        return;
    }

    // Programming errors (unexpected) - don't leak details
    res.status(500).json({
        success: false,
        error: {
            code: ERROR_CODES.INTERNAL_ERROR,
            message: 'An unexpected error occurred',
        },
    });
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: {
            code: ERROR_CODES.NOT_FOUND,
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
}

import type { Request, Response, NextFunction } from 'express';
import { z, ZodError, type ZodSchema } from 'zod';
import { ValidationError } from '../errors/index.js';

/**
 * Validation middleware factory
 * STRICT: All inputs validated with schema BEFORE reaching controller
 */
export function validate<T extends ZodSchema>(schema: T) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            // Validate request body
            const validated = schema.parse(req.body);

            // Attach validated data to request
            req.body = validated;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                next(new ValidationError(errors));
                return;
            }
            next(error);
        }
    };
}

/**
 * Query params validation middleware
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const validated = schema.parse(req.query);
            req.query = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                next(new ValidationError(errors));
                return;
            }
            next(error);
        }
    };
}

/**
 * Params validation middleware
 */
export function validateParams<T extends ZodSchema>(schema: T) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const validated = schema.parse(req.params);
            req.params = validated as typeof req.params;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                next(new ValidationError(errors));
                return;
            }
            next(error);
        }
    };
}

// Common validation schemas
export const paginationSchema = z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 20)),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const uuidParamSchema = z.object({
    id: z.string().uuid(),
});

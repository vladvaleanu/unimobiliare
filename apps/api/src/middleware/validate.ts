import type { Request, Response, NextFunction } from 'express';
import { z, ZodError, type ZodSchema } from 'zod';
import { ValidationError } from '../errors/index.js';

/**
 * Validation middleware factory
 * STRICT: All inputs validated with schema BEFORE reaching controller
 * 
 * Supports two schema styles:
 * 1. Simple: z.object({ email: z.string(), ... }) - validates body only
 * 2. Full: z.object({ body: z.object(...), query: z.object(...), params: z.object(...) })
 */
export function validate<T extends ZodSchema>(schema: T) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            // Check if schema expects body/query/params structure
            // by trying to parse full request first
            let validated: any;

            try {
                // Try full request structure first
                validated = schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });

                // Success - attach validated data back to request
                if (validated.body !== undefined) req.body = validated.body;
                if (validated.query !== undefined) req.query = validated.query;
                if (validated.params !== undefined) req.params = validated.params as typeof req.params;
            } catch (fullError) {
                // Full structure failed, try body-only (legacy schemas)
                validated = schema.parse(req.body);
                req.body = validated;
            }

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

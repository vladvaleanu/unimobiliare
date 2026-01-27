import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/index.js';
import { getEnv } from '../config/index.js';
import { ROLES, type Role } from '@unimobiliare/shared';

/**
 * JWT payload structure
 */
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
}

/**
 * Extended Request with user information
 */
export interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}

/**
 * Authentication middleware
 * STRICT: Validates JWT token from Authorization header
 */
export function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('No token provided');
        }

        const env = getEnv();
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        // Attach user to request
        (req as AuthenticatedRequest).user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedError('Token expired'));
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid token'));
            return;
        }
        next(error);
    }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export function optionalAuth(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            // No token, continue without user
            next();
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            next();
            return;
        }

        const env = getEnv();
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        // Attach user to request
        (req as AuthenticatedRequest).user = decoded;
        next();
    } catch {
        // Token invalid, continue without user
        next();
    }
}

/**
 * Authorization middleware factory
 * STRICT: Checks if user has required role
 */
export function authorize(...allowedRoles: Role[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const authReq = req as AuthenticatedRequest;

        if (!authReq.user) {
            next(new UnauthorizedError('Authentication required'));
            return;
        }

        if (!allowedRoles.includes(authReq.user.role)) {
            next(new ForbiddenError('Insufficient permissions'));
            return;
        }

        next();
    };
}

/**
 * Admin-only authorization shortcuts
 */
export const adminOnly = authorize(ROLES.ADMIN);
export const requireAdmin = authorize(ROLES.ADMIN);


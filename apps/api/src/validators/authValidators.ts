/**
 * Auth Validation Schemas
 *
 * STRICT: All inputs validated with Zod schema BEFORE reaching controller.
 */

import { z } from 'zod';
import { AUTH_CONFIG } from '../config/auth';

export const registerSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .max(255, 'Email too long'),
    password: z
        .string()
        .min(AUTH_CONFIG.PASSWORD_MIN_LENGTH, `Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters`)
        .max(128, 'Password too long'),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name too long')
        .trim(),
});

export const loginSchema = z.object({
    email: z
        .string()
        .email('Invalid email format'),
    password: z
        .string()
        .min(1, 'Password is required'),
});

export const refreshSchema = z.object({
    refreshToken: z
        .string()
        .min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
    refreshToken: z
        .string()
        .min(1, 'Refresh token is required'),
});

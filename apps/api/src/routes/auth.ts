/**
 * Auth Routes
 *
 * STRICT: Routes only wire endpoints to controllers with validation middleware.
 */

import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authController } from '../container';
import {
    registerSchema,
    loginSchema,
    refreshSchema,
    logoutSchema,
} from '../validators/authValidators';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user account
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * POST /api/v1/auth/login
 * Login with email and password
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', validate(refreshSchema), authController.refresh);

/**
 * POST /api/v1/auth/logout
 * Logout and revoke refresh token
 */
router.post('/logout', validate(logoutSchema), authController.logout);

/**
 * POST /api/v1/auth/logout-all
 * Logout from all devices (requires authentication)
 */
router.post('/logout-all', authenticate, authController.logoutAll);

export { router as authRoutes };

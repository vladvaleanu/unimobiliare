/**
 * Auth Controller
 *
 * STRICT: Controllers doar orchestrează - NU conțin business logic.
 * - Validare input (prin middleware)
 * - Apelează service
 * - Formatează response
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../services/authService';

export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * POST /api/v1/auth/register
     */
    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.authService.register(req.body);

            res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    tokens: result.tokens,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/auth/login
     */
    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.authService.login(req.body);

            res.json({
                success: true,
                data: {
                    user: result.user,
                    tokens: result.tokens,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/auth/refresh
     */
    refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refreshToken } = req.body;
            const tokens = await this.authService.refresh(refreshToken);

            res.json({
                success: true,
                data: { tokens },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/auth/logout
     */
    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refreshToken } = req.body;
            await this.authService.logout(refreshToken);

            res.json({
                success: true,
                data: { message: 'Logged out successfully' },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/auth/logout-all
     * Requires authentication
     */
    logoutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // User is attached by auth middleware
            const userId = (req as any).user.userId;
            await this.authService.logoutAllDevices(userId);

            res.json({
                success: true,
                data: { message: 'Logged out from all devices' },
            });
        } catch (error) {
            next(error);
        }
    };
}

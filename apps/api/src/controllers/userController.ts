/**
 * User Controller
 * 
 * STRICT: Controllers only orchestrate - NO business logic
 */

import type { Request, Response, NextFunction } from 'express';
import type { IUserService } from '../services/userService';

export class UserController {
    constructor(private userService: IUserService) { }

    /**
     * GET /api/v1/users
     */
    getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
            const search = req.query.search as string | undefined;
            const role = req.query.role as string | undefined;
            const subscriptionStatus = req.query.subscriptionStatus as string | undefined;

            const result = await this.userService.getUsers({
                page,
                limit,
                search,
                role,
                subscriptionStatus,
            });

            res.json({
                success: true,
                data: result.users,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/users/:id
     */
    getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.userService.getUserById(req.params.id);

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/users/:id
     */
    updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, role, subscriptionStatus } = req.body;
            const user = await this.userService.updateUser(req.params.id, {
                name,
                role,
                subscriptionStatus,
            });

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/users/:id
     */
    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.userService.deleteUser(req.params.id);

            res.json({
                success: true,
                data: { message: 'User deleted successfully' },
            });
        } catch (error) {
            next(error);
        }
    };
}

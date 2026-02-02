/**
 * User Routes
 * 
 * STRICT: Routes only wire endpoints to controllers (admin only)
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';
import { getPrismaClient } from '@unimobiliare/database';

const router = Router();

// Create instances
const userRepository = new UserRepository(getPrismaClient());
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * GET /api/v1/users
 * List all users with pagination and filters
 */
router.get('/', userController.getUsers);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
router.get('/:id', userController.getUserById);

/**
 * PUT /api/v1/users/:id
 * Update user
 */
router.put('/:id', userController.updateUser);

/**
 * DELETE /api/v1/users/:id
 * Soft delete user
 */
router.delete('/:id', userController.deleteUser);

export { router as userRoutes };

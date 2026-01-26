/**
 * Dependency Injection Container
 *
 * STRICT: All dependencies are instantiated here and injected into services/controllers.
 * This follows the Dependency Inversion Principle.
 */

import { getPrismaClient } from '@unimobiliare/database';

// Repositories
import { UserRepository } from '../repositories/userRepository';
import { RefreshTokenRepository } from '../repositories/refreshTokenRepository';

// Services
import { AuthService } from '../services/authService';

// Controllers
import { AuthController } from '../controllers/authController';

// ─────────────────────────────────────────────────────────────────────────────
// Create instances
// ─────────────────────────────────────────────────────────────────────────────

const prisma = getPrismaClient();

// Repositories
export const userRepository = new UserRepository(prisma);
export const refreshTokenRepository = new RefreshTokenRepository(prisma);

// Services
export const authService = new AuthService(userRepository, refreshTokenRepository);

// Controllers
export const authController = new AuthController(authService);

/**
 * Dependency Injection Container
 *
 * STRICT: All dependencies are instantiated here and injected into services/controllers.
 * This follows the Dependency Inversion Principle.
 */

import { getPrismaClient } from '@unimobiliare/database';

// Repositories
import { UserRepository } from './repositories/userRepository';
import { RefreshTokenRepository } from './repositories/refreshTokenRepository';
import { IntegrationRepository } from './repositories/integrationRepository';

// Services
import { AuthService } from './services/authService';
import { IntegrationService } from './services/integrationService';

// Controllers
import { AuthController } from './controllers/authController';
import { IntegrationController } from './controllers/integrationController';

// ─────────────────────────────────────────────────────────────────────────────
// Create instances
// ─────────────────────────────────────────────────────────────────────────────

const prisma = getPrismaClient();

// Repositories
const userRepository = new UserRepository(prisma);
const refreshTokenRepository = new RefreshTokenRepository(prisma);
const integrationRepository = new IntegrationRepository(prisma);

// Services
const authService = new AuthService(userRepository, refreshTokenRepository);
const integrationService = new IntegrationService(integrationRepository);

// Controllers
const authController = new AuthController(authService);
const integrationController = new IntegrationController(integrationService);

// ─────────────────────────────────────────────────────────────────────────────
// Export container
// ─────────────────────────────────────────────────────────────────────────────

export const container = {
    // Repositories
    userRepository,
    refreshTokenRepository,
    integrationRepository,

    // Services
    authService,
    integrationService,

    // Controllers
    authController,
    integrationController,
};

// Legacy exports for backwards compatibility
export { authController, authService, userRepository, refreshTokenRepository };


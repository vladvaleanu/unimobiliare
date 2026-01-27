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
import { PlanRepository } from './repositories/planRepository';

// Services
import { AuthService } from './services/authService';
import { IntegrationService } from './services/integrationService';
import { PlanService } from './services/planService';

// Controllers
import { AuthController } from './controllers/authController';
import { IntegrationController } from './controllers/integrationController';
import { PlanController } from './controllers/planController';

// ─────────────────────────────────────────────────────────────────────────────
// Create instances
// ─────────────────────────────────────────────────────────────────────────────

const prisma = getPrismaClient();

// Repositories
const userRepository = new UserRepository(prisma);
const refreshTokenRepository = new RefreshTokenRepository(prisma);
const integrationRepository = new IntegrationRepository(prisma);
const planRepository = new PlanRepository(prisma);

// Services
const authService = new AuthService(userRepository, refreshTokenRepository);
const integrationService = new IntegrationService(integrationRepository);
const planService = new PlanService(planRepository);

// Controllers
const authController = new AuthController(authService);
const integrationController = new IntegrationController(integrationService);
const planController = new PlanController(planService);

// ─────────────────────────────────────────────────────────────────────────────
// Export container
// ─────────────────────────────────────────────────────────────────────────────

export const container = {
    // Repositories
    userRepository,
    refreshTokenRepository,
    integrationRepository,
    planRepository,

    // Services
    authService,
    integrationService,
    planService,

    // Controllers
    authController,
    integrationController,
    planController,
};

// Legacy exports for backwards compatibility
export { authController, authService, userRepository, refreshTokenRepository };



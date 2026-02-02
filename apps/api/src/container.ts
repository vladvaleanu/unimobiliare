/**
 * Dependency Injection Container
 *
 * STRICT: All dependencies are instantiated here and injected into services/controllers.
 * This follows the Dependency Inversion Principle.
 */

import { getPrismaClient } from '@unimobiliare/database';
import { loadEnv } from './config/index.js';

// Load environment variables before instantiating services
loadEnv();

// Repositories
import { UserRepository } from './repositories/userRepository';
import { RefreshTokenRepository } from './repositories/refreshTokenRepository';
import { IntegrationRepository } from './repositories/integrationRepository';
import { PlanRepository } from './repositories/planRepository';
import { SubscriptionRepository } from './repositories/subscriptionRepository';

// Services
import { AuthService } from './services/authService';
import { IntegrationService } from './services/integrationService';
import { PlanService } from './services/planService';
import { StripeService } from './services/stripeService';
import { SubscriptionService } from './services/subscriptionService';

// Controllers
import { AuthController } from './controllers/authController';
import { IntegrationController } from './controllers/integrationController';
import { PlanController } from './controllers/planController';
import { SubscriptionController } from './controllers/subscriptionController';

// ─────────────────────────────────────────────────────────────────────────────
// Create instances
// ─────────────────────────────────────────────────────────────────────────────

const prisma = getPrismaClient();


// Repositories
const userRepository = new UserRepository(prisma);
const refreshTokenRepository = new RefreshTokenRepository(prisma);
const integrationRepository = new IntegrationRepository(prisma);
const planRepository = new PlanRepository(prisma);
const subscriptionRepository = new SubscriptionRepository(prisma);

// Services
const authService = new AuthService(userRepository, refreshTokenRepository);
const integrationService = new IntegrationService(integrationRepository);
const planService = new PlanService(planRepository);
const stripeService = new StripeService();
const subscriptionService = new SubscriptionService(
    subscriptionRepository,
    planRepository,
    stripeService
);

// Controllers
const authController = new AuthController(authService);
const integrationController = new IntegrationController(integrationService);
const planController = new PlanController(planService);
const subscriptionController = new SubscriptionController(subscriptionService);

// ─────────────────────────────────────────────────────────────────────────────
// Export container
// ─────────────────────────────────────────────────────────────────────────────

export const container = {
    // Repositories
    userRepository,
    refreshTokenRepository,
    integrationRepository,
    planRepository,
    subscriptionRepository,

    // Services
    authService,
    integrationService,
    planService,
    stripeService,
    subscriptionService,

    // Controllers
    authController,
    integrationController,
    planController,
    subscriptionController,
};

// Legacy exports for backwards compatibility
export { authController, authService, userRepository, refreshTokenRepository };




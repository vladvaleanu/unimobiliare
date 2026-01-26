import { Router } from 'express';
import { healthRoutes } from './health';
import { authRoutes } from './auth';

const router = Router();

// Health check endpoints
router.use('/health', healthRoutes);

// Authentication endpoints
router.use('/auth', authRoutes);

// TODO: Add more routes as they're implemented
// router.use('/users', userRoutes);
// router.use('/listings', listingRoutes);
// router.use('/integrations', integrationRoutes);
// router.use('/plans', planRoutes);

export { router as apiRoutes };

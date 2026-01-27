import { Router } from 'express';
import { healthRoutes } from './health';
import { authRoutes } from './auth';
import { integrationRoutes } from './integrations';
import { planRoutes } from './plans';

const router = Router();

// Health check endpoints
router.use('/health', healthRoutes);

// Authentication endpoints
router.use('/auth', authRoutes);

// Integration management endpoints (admin only)
router.use('/integrations', integrationRoutes);

// Subscription plan endpoints (mixed access)
router.use('/plans', planRoutes);

// TODO: Add more routes as they're implemented
// router.use('/users', userRoutes);
// router.use('/listings', listingRoutes);

export { router as apiRoutes };



import { Router } from 'express';
import { healthRoutes } from './health';
import { authRoutes } from './auth';
import { integrationRoutes } from './integrations';
import { planRoutes } from './plans';
import { subscriptionRoutes } from './subscriptions';
import { webhookRoutes } from './webhooks';
import { listingRoutes } from './listings';
import { userRoutes } from './users';
import { adminRoutes } from './admin';
import { aiRoutes } from './ai';

const router = Router();

// Health check endpoints
router.use('/health', healthRoutes);

// Authentication endpoints
router.use('/auth', authRoutes);

// Integration management endpoints (admin only)
router.use('/integrations', integrationRoutes);

// Subscription plan endpoints (mixed access)
router.use('/plans', planRoutes);

// User subscription management endpoints
router.use('/subscriptions', subscriptionRoutes);

// Webhook endpoints (external services)
router.use('/webhooks', webhookRoutes);

// Listing endpoints
router.use('/listings', listingRoutes);

// User management endpoints (admin only)
router.use('/users', userRoutes);

// Admin endpoints (stats, audit logs)
router.use('/admin', adminRoutes);

// AI Gateway endpoints
router.use('/ai', aiRoutes);

export { router as apiRoutes };

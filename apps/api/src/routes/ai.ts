/**
 * AI Routes
 * 
 * API endpoints for AI Gateway functionality.
 */

import { Router } from 'express';
import { asyncHandler } from '@unimobiliare/shared';
import { authenticate, requireAdmin } from '../middleware/auth';
import * as aiController from '../controllers/aiController';

const router = Router();

/**
 * GET /api/v1/ai/health
 * Check AI service health (public for monitoring)
 */
router.get('/health', asyncHandler(aiController.healthCheck));

// Protected endpoints - require authentication
router.use(authenticate);

/**
 * POST /api/v1/ai/extract-features
 * Extract features from property description
 */
router.post('/extract-features', asyncHandler(aiController.extractFeatures));

/**
 * POST /api/v1/ai/embed
 * Generate embeddings for texts
 */
router.post('/embed', asyncHandler(aiController.generateEmbeddings));

/**
 * POST /api/v1/ai/generate
 * General-purpose AI generation
 */
router.post('/generate', asyncHandler(aiController.generate));

// Admin-only endpoints
router.use(requireAdmin);

/**
 * POST /api/v1/ai/detect-fraud
 * Analyze listing for fraud (admin only)
 */
router.post('/detect-fraud', asyncHandler(aiController.detectFraud));

export const aiRoutes = router;

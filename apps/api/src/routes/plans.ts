/**
 * Subscription Plan Routes
 *
 * API routes for subscription plan management.
 * Mixed access: Admin-only for CUD, Public read for active plans.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '@unimobiliare/shared';
import { validate } from '../middleware/validate';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth';
import { container } from '../container';
import {
    createPlanSchema,
    updatePlanSchema,
    getPlanSchema,
    getPlanBySlugSchema,
    listPlansSchema,
    toggleActiveSchema,
    toggleFeaturedSchema,
    reorderPlansSchema,
} from '../validators/planValidators';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/plans/active
 * Get all active plans (public - for pricing page)
 */
router.get(
    '/active',
    optionalAuth,
    asyncHandler(async (req: Request, res: Response) => {
        await container.planController.getActive(req, res);
    })
);

/**
 * GET /api/v1/plans/slug/:slug
 * Get a plan by slug (public)
 */
router.get(
    '/slug/:slug',
    optionalAuth,
    validate(getPlanBySlugSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await container.planController.getBySlug(req, res);
    })
);

// ─────────────────────────────────────────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/plans
 * List all plans (admin only)
 */
router.get(
    '/',
    authenticate,
    requireAdmin,
    validate(listPlansSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await container.planController.getAll(req, res);
    })
);

/**
 * GET /api/v1/plans/:id
 * Get a single plan by ID (admin only)
 */
router.get(
    '/:id',
    authenticate,
    requireAdmin,
    validate(getPlanSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await container.planController.getById(req, res);
    })
);

/**
 * POST /api/v1/plans
 * Create a new plan (admin only)
 */
router.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createPlanSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await container.planController.create(req, res);
    })
);

/**
 * PUT /api/v1/plans/:id
 * Update an existing plan (admin only)
 */
router.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updatePlanSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await container.planController.update(req, res);
    })
);

/**
 * DELETE /api/v1/plans/:id
 * Delete a plan (admin only)
 */
router.delete(
    '/:id',
    authenticate,
    requireAdmin,
    validate(getPlanSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await container.planController.delete(req, res);
    })
);

/**
 * PATCH /api/v1/plans/:id/toggle-active
 * Toggle plan active status (admin only)
 */
router.patch(
    '/:id/toggle-active',
    authenticate,
    requireAdmin,
    validate(toggleActiveSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await container.planController.toggleActive(req, res);
    })
);

/**
 * PATCH /api/v1/plans/:id/toggle-featured
 * Toggle plan featured status (admin only)
 */
router.patch(
    '/:id/toggle-featured',
    authenticate,
    requireAdmin,
    validate(toggleFeaturedSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await container.planController.toggleFeatured(req, res);
    })
);

/**
 * POST /api/v1/plans/reorder
 * Reorder plans (admin only)
 */
router.post(
    '/reorder',
    authenticate,
    requireAdmin,
    validate(reorderPlansSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await container.planController.reorder(req, res);
    })
);

export const planRoutes = router;

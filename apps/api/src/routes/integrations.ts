/**
 * Integration Routes
 *
 * API routes for integration management.
 * Admin-only endpoints.
 */

import { Router } from 'express';
import { asyncHandler } from '@unimobiliare/shared';
import { validate } from '../middleware/validate';
import { authenticate, requireAdmin } from '../middleware/auth';
import { container } from '../container';
import {
    createIntegrationSchema,
    updateIntegrationSchema,
    getIntegrationSchema,
    listIntegrationsSchema,
    toggleEnabledSchema,
    triggerSyncSchema,
} from '../validators/integrationValidators';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * GET /api/v1/integrations
 * List all integrations with pagination and filtering
 */
router.get(
    '/',
    validate(listIntegrationsSchema),
    asyncHandler(async (req, res) => {
        await container.integrationController.getAll(req, res);
    })
);

/**
 * GET /api/v1/integrations/:id
 * Get a single integration by ID
 */
router.get(
    '/:id',
    validate(getIntegrationSchema),
    asyncHandler(async (req, res) => {
        await container.integrationController.getById(req, res);
    })
);

/**
 * POST /api/v1/integrations
 * Create a new integration
 */
router.post(
    '/',
    validate(createIntegrationSchema),
    asyncHandler(async (req, res) => {
        await container.integrationController.create(req, res);
    })
);

/**
 * PUT /api/v1/integrations/:id
 * Update an existing integration
 */
router.put(
    '/:id',
    validate(updateIntegrationSchema),
    asyncHandler(async (req, res) => {
        await container.integrationController.update(req, res);
    })
);

/**
 * DELETE /api/v1/integrations/:id
 * Delete an integration
 */
router.delete(
    '/:id',
    validate(getIntegrationSchema),
    asyncHandler(async (req, res) => {
        await container.integrationController.delete(req, res);
    })
);

/**
 * PATCH /api/v1/integrations/:id/toggle
 * Enable or disable an integration
 */
router.patch(
    '/:id/toggle',
    validate(toggleEnabledSchema),
    asyncHandler(async (req, res) => {
        await container.integrationController.toggleEnabled(req, res);
    })
);

/**
 * POST /api/v1/integrations/:id/sync
 * Trigger manual sync for an integration
 */
router.post(
    '/:id/sync',
    validate(triggerSyncSchema),
    asyncHandler(async (req, res) => {
        await container.integrationController.triggerSync(req, res);
    })
);

// ─────────────────────────────────────────────────────────────────────────────
// Integration Builder Endpoints (No-Code)
// ─────────────────────────────────────────────────────────────────────────────

import * as builderController from '../controllers/integrationBuilderController';

/**
 * POST /api/v1/integrations/builder/test-selector
 * Test a CSS selector on a URL or HTML content
 */
router.post(
    '/builder/test-selector',
    asyncHandler(builderController.testSelector)
);

/**
 * POST /api/v1/integrations/builder/preview
 * Preview field extractions on a URL
 */
router.post(
    '/builder/preview',
    asyncHandler(builderController.previewExtraction)
);

/**
 * POST /api/v1/integrations/builder/fetch-page
 * Fetch a page HTML for client-side testing
 */
router.post(
    '/builder/fetch-page',
    asyncHandler(builderController.fetchPage)
);

/**
 * POST /api/v1/integrations/builder/batch-test
 * Test extraction on multiple URLs (max 10)
 */
router.post(
    '/builder/batch-test',
    asyncHandler(builderController.batchTest)
);

export const integrationRoutes = router;

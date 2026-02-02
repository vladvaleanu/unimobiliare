/**
 * Subscription Routes
 *
 * API routes for user subscription management.
 * All routes require authentication.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '@unimobiliare/shared';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { container } from '../container';
import {
    createCheckoutSchema,
} from '../validators/subscriptionValidators';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/subscriptions/current
 * Get current user's subscription
 */
router.get(
    '/current',
    asyncHandler(async (req: Request, res: Response) => {
        await container.subscriptionController.getCurrent(req, res);
    })
);

/**
 * POST /api/v1/subscriptions/checkout
 * Create a Stripe Checkout session
 */
router.post(
    '/checkout',
    validate(createCheckoutSchema),
    asyncHandler(async (req: Request, res: Response) => {
        await container.subscriptionController.createCheckout(req, res);
    })
);

/**
 * POST /api/v1/subscriptions/portal
 * Create a Stripe Customer Portal session
 */
router.post(
    '/portal',
    asyncHandler(async (req: Request, res: Response) => {
        await container.subscriptionController.createPortal(req, res);
    })
);

/**
 * POST /api/v1/subscriptions/cancel
 * Cancel subscription at period end
 */
router.post(
    '/cancel',
    asyncHandler(async (req: Request, res: Response) => {
        await container.subscriptionController.cancel(req, res);
    })
);

/**
 * POST /api/v1/subscriptions/reactivate
 * Reactivate a canceled subscription
 */
router.post(
    '/reactivate',
    asyncHandler(async (req: Request, res: Response) => {
        await container.subscriptionController.reactivate(req, res);
    })
);

export const subscriptionRoutes = router;

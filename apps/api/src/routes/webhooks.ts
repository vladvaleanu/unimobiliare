/**
 * Stripe Webhook Routes
 *
 * Handles incoming webhooks from Stripe for subscription lifecycle events.
 * IMPORTANT: This route must use raw body parsing for signature verification.
 */

import { Router, Request, Response } from 'express';
import { container } from '../container';

const router = Router();

/**
 * POST /api/v1/webhooks/stripe
 * Handle Stripe webhook events
 * 
 * Note: This endpoint bypasses JSON body parsing.
 * The raw body is needed for Stripe signature verification.
 */
router.post(
    '/stripe',
    async (req: Request, res: Response) => {
        const signature = req.headers['stripe-signature'] as string;

        if (!signature) {
            res.status(400).json({
                success: false,
                error: 'Missing stripe-signature header',
            });
            return;
        }

        try {
            // Get raw body (requires express.raw middleware on this route)
            const rawBody = req.body;

            // Verify and construct the event
            const event = container.stripeService.constructWebhookEvent(rawBody, signature);

            // Handle the event
            await container.subscriptionService.handleWebhookEvent(event);

            res.json({ received: true });
        } catch (error) {
            console.error('Webhook error:', error);
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Webhook handler failed',
            });
        }
    }
);

export const webhookRoutes = router;

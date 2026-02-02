/**
 * Subscription Controller
 *
 * HTTP layer for subscription management endpoints.
 */

import { Request, Response } from 'express';
import { ISubscriptionService } from '../services/subscriptionService';
import { AuthenticatedRequest } from '../middleware/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface ISubscriptionController {
    getCurrent(req: Request, res: Response): Promise<void>;
    createCheckout(req: Request, res: Response): Promise<void>;
    createPortal(req: Request, res: Response): Promise<void>;
    cancel(req: Request, res: Response): Promise<void>;
    reactivate(req: Request, res: Response): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class SubscriptionController implements ISubscriptionController {
    constructor(private subscriptionService: ISubscriptionService) { }

    /**
     * Get current user's subscription
     */
    async getCurrent(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;

        const subscription = await this.subscriptionService.getByUserId(userId);

        res.json({
            success: true,
            data: subscription,
        });
    }

    /**
     * Create a Stripe Checkout session
     */
    async createCheckout(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthenticatedRequest;
        const { userId, email } = authReq.user;
        const { planSlug, interval } = req.body;

        const result = await this.subscriptionService.createCheckoutSession(
            userId,
            email,
            planSlug,
            interval
        );

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * Create a Stripe Customer Portal session
     */
    async createPortal(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;

        const result = await this.subscriptionService.createPortalSession(userId);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * Cancel subscription (at period end)
     */
    async cancel(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;

        const subscription = await this.subscriptionService.cancelSubscription(userId);

        res.json({
            success: true,
            data: subscription,
            message: 'Subscription will be canceled at the end of the current billing period',
        });
    }

    /**
     * Reactivate a canceled subscription
     */
    async reactivate(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;

        const subscription = await this.subscriptionService.reactivateSubscription(userId);

        res.json({
            success: true,
            data: subscription,
            message: 'Subscription reactivated successfully',
        });
    }
}

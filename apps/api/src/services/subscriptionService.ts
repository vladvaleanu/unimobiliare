/**
 * Subscription Service
 *
 * Business logic for subscription management.
 * Coordinates between StripeService and SubscriptionRepository.
 */

import { Subscription, SubscriptionStatus } from '@prisma/client';
import { ISubscriptionRepository, SubscriptionCreateInput } from '../repositories/subscriptionRepository';
import { IPlanRepository } from '../repositories/planRepository';
import { IStripeService, CreateCheckoutSessionInput } from './stripeService';
import { NotFoundError, ConflictError, ValidationError } from '../errors';
import { getEnv } from '../config/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface ISubscriptionService {
    getByUserId(userId: string): Promise<Subscription | null>;
    createCheckoutSession(userId: string, email: string, planSlug: string, interval: 'month' | 'year'): Promise<{ sessionId: string; url: string }>;
    createPortalSession(userId: string): Promise<{ url: string }>;
    cancelSubscription(userId: string): Promise<Subscription>;
    reactivateSubscription(userId: string): Promise<Subscription>;
    handleWebhookEvent(event: any): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class SubscriptionService implements ISubscriptionService {
    constructor(
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository,
        private stripeService: IStripeService
    ) { }

    async getByUserId(userId: string): Promise<Subscription | null> {
        return this.subscriptionRepository.findByUserId(userId);
    }

    async createCheckoutSession(
        userId: string,
        email: string,
        planSlug: string,
        interval: 'month' | 'year'
    ): Promise<{ sessionId: string; url: string }> {
        // Check if user already has an active subscription
        const existing = await this.subscriptionRepository.findByUserId(userId);
        if (existing && ['active', 'trialing'].includes(existing.status)) {
            throw new ConflictError(
                'User already has an active subscription. Use portal to manage.',
                'SUBSCRIPTION_EXISTS'
            );
        }

        // Get the plan
        const plan = await this.planRepository.findBySlug(planSlug);
        if (!plan) {
            throw new NotFoundError('Subscription plan not found', 'PLAN_NOT_FOUND');
        }

        if (!plan.isActive) {
            throw new ValidationError('This plan is not available', 'PLAN_INACTIVE');
        }

        // Get the Stripe price ID
        const stripePriceIds = plan.stripePriceIds as { monthly?: string; yearly?: string } | null;
        const priceId = interval === 'month'
            ? stripePriceIds?.monthly
            : stripePriceIds?.yearly;

        if (!priceId) {
            throw new ValidationError(
                `No Stripe price configured for ${interval}ly billing`,
                'STRIPE_PRICE_MISSING'
            );
        }

        const env = getEnv();
        const baseUrl = env.APP_URL;

        return this.stripeService.createCheckoutSession({
            userId,
            email,
            planId: plan.id,
            priceId,
            interval,
            successUrl: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseUrl}/subscription/cancel`,
            trialDays: plan.trialDays || undefined,
        });
    }

    async createPortalSession(userId: string): Promise<{ url: string }> {
        const subscription = await this.subscriptionRepository.findByUserId(userId);

        if (!subscription) {
            throw new NotFoundError('No subscription found', 'SUBSCRIPTION_NOT_FOUND');
        }

        const env = getEnv();

        return this.stripeService.createPortalSession({
            customerId: subscription.stripeCustomerId,
            returnUrl: `${env.APP_URL}/account`,
        });
    }

    async cancelSubscription(userId: string): Promise<Subscription> {
        const subscription = await this.subscriptionRepository.findByUserId(userId);

        if (!subscription) {
            throw new NotFoundError('No subscription found', 'SUBSCRIPTION_NOT_FOUND');
        }

        if (!['active', 'trialing'].includes(subscription.status)) {
            throw new ValidationError('Subscription is not active', 'SUBSCRIPTION_NOT_ACTIVE');
        }

        // Cancel at period end via Stripe
        await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId, false);

        // Update local record
        return this.subscriptionRepository.update(subscription.id, {
            cancelAtPeriodEnd: true,
            canceledAt: new Date(),
        });
    }

    async reactivateSubscription(userId: string): Promise<Subscription> {
        const subscription = await this.subscriptionRepository.findByUserId(userId);

        if (!subscription) {
            throw new NotFoundError('No subscription found', 'SUBSCRIPTION_NOT_FOUND');
        }

        if (!subscription.cancelAtPeriodEnd) {
            throw new ValidationError('Subscription is not scheduled for cancellation', 'SUBSCRIPTION_NOT_CANCELED');
        }

        // Reactivate via Stripe (update cancel_at_period_end to false)
        // This is handled by updating the subscription
        const stripeSubscription = await this.stripeService.getSubscription(subscription.stripeSubscriptionId);

        if (!stripeSubscription) {
            throw new NotFoundError('Stripe subscription not found', 'STRIPE_SUBSCRIPTION_NOT_FOUND');
        }

        // Update local record
        return this.subscriptionRepository.update(subscription.id, {
            cancelAtPeriodEnd: false,
            canceledAt: null,
        });
    }

    /**
     * Handle Stripe webhook events for subscription lifecycle
     */
    async handleWebhookEvent(event: any): Promise<void> {
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object);
                break;

            case 'customer.subscription.created':
                await this.handleSubscriptionCreated(event.data.object);
                break;

            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;

            case 'invoice.payment_succeeded':
                await this.handlePaymentSucceeded(event.data.object);
                break;

            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;

            default:
                console.log(`Unhandled webhook event: ${event.type}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Private Webhook Handlers
    // ─────────────────────────────────────────────────────────────────────────────

    private async handleCheckoutCompleted(session: any): Promise<void> {
        const { userId, planId } = session.metadata;

        if (!userId || !planId) {
            console.error('Missing metadata in checkout session:', session.id);
            return;
        }

        // The subscription.created event will handle creating the subscription record
        console.log(`Checkout completed for user ${userId}, plan ${planId}`);
    }

    private async handleSubscriptionCreated(stripeSubscription: any): Promise<void> {
        const { userId, planId } = stripeSubscription.metadata;

        if (!userId || !planId) {
            console.error('Missing metadata in subscription:', stripeSubscription.id);
            return;
        }

        // Check if subscription already exists
        const existing = await this.subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.id);
        if (existing) {
            console.log(`Subscription ${stripeSubscription.id} already exists`);
            return;
        }

        const status = this.mapStripeStatus(stripeSubscription.status);

        await this.subscriptionRepository.create({
            userId,
            planId,
            stripeCustomerId: stripeSubscription.customer,
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: stripeSubscription.items.data[0]?.price.id,
            status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            trialEnd: stripeSubscription.trial_end
                ? new Date(stripeSubscription.trial_end * 1000)
                : null,
        });

        console.log(`Created subscription for user ${userId}`);
    }

    private async handleSubscriptionUpdated(stripeSubscription: any): Promise<void> {
        const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            stripeSubscription.id
        );

        if (!subscription) {
            console.log(`Subscription ${stripeSubscription.id} not found locally`);
            return;
        }

        const status = this.mapStripeStatus(stripeSubscription.status);

        await this.subscriptionRepository.update(subscription.id, {
            stripePriceId: stripeSubscription.items.data[0]?.price.id,
            status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            trialEnd: stripeSubscription.trial_end
                ? new Date(stripeSubscription.trial_end * 1000)
                : null,
        });

        console.log(`Updated subscription ${subscription.id}`);
    }

    private async handleSubscriptionDeleted(stripeSubscription: any): Promise<void> {
        const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            stripeSubscription.id
        );

        if (!subscription) {
            console.log(`Subscription ${stripeSubscription.id} not found locally`);
            return;
        }

        await this.subscriptionRepository.update(subscription.id, {
            status: 'canceled',
            canceledAt: new Date(),
        });

        console.log(`Marked subscription ${subscription.id} as canceled`);
    }

    private async handlePaymentSucceeded(invoice: any): Promise<void> {
        if (!invoice.subscription) return;

        const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            invoice.subscription
        );

        if (!subscription) {
            return;
        }

        // Payment succeeded, ensure status is active
        if (subscription.status !== 'active') {
            await this.subscriptionRepository.update(subscription.id, {
                status: 'active',
            });
        }

        console.log(`Payment succeeded for subscription ${subscription.id}`);
    }

    private async handlePaymentFailed(invoice: any): Promise<void> {
        if (!invoice.subscription) return;

        const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            invoice.subscription
        );

        if (!subscription) {
            return;
        }

        // Mark as past_due
        await this.subscriptionRepository.update(subscription.id, {
            status: 'past_due',
        });

        console.log(`Payment failed for subscription ${subscription.id}`);
        // TODO: Send email notification to user
    }

    private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
        const statusMap: Record<string, SubscriptionStatus> = {
            active: 'active',
            trialing: 'trialing',
            past_due: 'past_due',
            canceled: 'canceled',
            unpaid: 'unpaid',
            incomplete: 'incomplete',
            incomplete_expired: 'incomplete_expired',
        };

        return statusMap[stripeStatus] || 'incomplete';
    }
}

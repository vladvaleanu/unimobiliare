/**
 * Stripe Service
 *
 * Handles all Stripe payment operations:
 * - Checkout sessions
 * - Customer management
 * - Subscription management
 * - Customer portal sessions
 */

import Stripe from 'stripe';
import { getEnv } from '../config/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateCheckoutSessionInput {
    userId: string;
    email: string;
    planId: string;
    priceId: string;
    interval: 'month' | 'year';
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
}

export interface CreatePortalSessionInput {
    customerId: string;
    returnUrl: string;
}

export interface IStripeService {
    createCheckoutSession(input: CreateCheckoutSessionInput): Promise<{ sessionId: string; url: string }>;
    createPortalSession(input: CreatePortalSessionInput): Promise<{ url: string }>;
    getCustomer(customerId: string): Promise<Stripe.Customer | null>;
    getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null>;
    cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<Stripe.Subscription>;
    updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Subscription>;
    constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class StripeService implements IStripeService {
    private stripe: Stripe;
    private webhookSecret: string;

    constructor() {
        const env = getEnv();

        this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-11-20.acacia',
            typescript: true,
        });

        this.webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    }

    /**
     * Create a Stripe Checkout session for subscription
     */
    async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<{ sessionId: string; url: string }> {
        const {
            userId,
            email,
            planId,
            priceId,
            successUrl,
            cancelUrl,
            trialDays,
        } = input;

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId,
                planId,
            },
            subscription_data: {
                metadata: {
                    userId,
                    planId,
                },
            },
        };

        // Add trial period if specified
        if (trialDays && trialDays > 0) {
            sessionParams.subscription_data!.trial_period_days = trialDays;
        }

        const session = await this.stripe.checkout.sessions.create(sessionParams);

        return {
            sessionId: session.id,
            url: session.url!,
        };
    }

    /**
     * Create a Stripe Customer Portal session for subscription management
     */
    async createPortalSession(input: CreatePortalSessionInput): Promise<{ url: string }> {
        const { customerId, returnUrl } = input;

        const session = await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        return {
            url: session.url,
        };
    }

    /**
     * Get a Stripe customer by ID
     */
    async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
        try {
            const customer = await this.stripe.customers.retrieve(customerId);

            if (customer.deleted) {
                return null;
            }

            return customer as Stripe.Customer;
        } catch (error) {
            if ((error as Stripe.errors.StripeError).code === 'resource_missing') {
                return null;
            }
            throw error;
        }
    }

    /**
     * Get a Stripe subscription by ID
     */
    async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            return subscription;
        } catch (error) {
            if ((error as Stripe.errors.StripeError).code === 'resource_missing') {
                return null;
            }
            throw error;
        }
    }

    /**
     * Cancel a subscription
     */
    async cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
        if (immediately) {
            return this.stripe.subscriptions.cancel(subscriptionId);
        }

        // Cancel at period end (recommended)
        return this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
    }

    /**
     * Update a subscription to a new price/plan
     */
    async updateSubscription(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

        return this.stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: subscription.items.data[0].id,
                    price: newPriceId,
                },
            ],
            proration_behavior: 'create_prorations',
        });
    }

    /**
     * Construct and verify a webhook event from Stripe
     */
    constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
        return this.stripe.webhooks.constructEvent(
            payload,
            signature,
            this.webhookSecret
        );
    }
}

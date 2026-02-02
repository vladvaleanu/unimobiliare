/**
 * Subscription Validators
 *
 * Zod schemas for subscription request validation.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const createCheckoutSchema = z.object({
    body: z.object({
        planSlug: z.string().min(1).max(50),
        interval: z.enum(['month', 'year']),
    }),
});

export const createPortalSchema = z.object({
    // No additional body params needed, uses authenticated user
});

export const cancelSubscriptionSchema = z.object({
    // No additional body params needed
});

export const reactivateSubscriptionSchema = z.object({
    // No additional body params needed
});

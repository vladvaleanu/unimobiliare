/**
 * Subscription Plan Validators
 *
 * Zod schemas for plan request validation.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Nested Schemas
// ─────────────────────────────────────────────────────────────────────────────

const limitsSchema = z.object({
    maxSearchProfiles: z.number().min(0).max(1000),
    maxSavedListings: z.number().min(0).max(10000),
    maxAlerts: z.number().min(0).max(100),
});

const featuresSchema = z.object({
    aiFeatures: z.boolean().default(false),
    priceHistory: z.boolean().default(false),
    exportData: z.boolean().default(false),
    prioritySupport: z.boolean().default(false),
    apiAccess: z.boolean().default(false),
});

const alertTypeEnum = z.enum(['email_instant', 'email_daily', 'email_weekly', 'push']);

// ─────────────────────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const createPlanSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(100),
        slug: z
            .string()
            .min(1)
            .max(50)
            .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
            .optional(),
        description: z.string().max(500).optional(),
        priceMonthly: z.number().min(0).max(10000),
        priceYearly: z.number().min(0).max(100000),
        trialDays: z.number().min(0).max(365).default(0),
        limits: limitsSchema,
        features: featuresSchema,
        alertTypes: z.array(alertTypeEnum).min(0),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        displayOrder: z.number().min(0).max(100).default(0),
        stripePriceIds: z
            .object({
                monthly: z.string().optional(),
                yearly: z.string().optional(),
            })
            .optional(),
    }),
});

export const updatePlanSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).nullable().optional(),
        priceMonthly: z.number().min(0).max(10000).optional(),
        priceYearly: z.number().min(0).max(100000).optional(),
        trialDays: z.number().min(0).max(365).optional(),
        limits: limitsSchema.optional(),
        features: featuresSchema.optional(),
        alertTypes: z.array(alertTypeEnum).optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        displayOrder: z.number().min(0).max(100).optional(),
        stripePriceIds: z
            .object({
                monthly: z.string().optional(),
                yearly: z.string().optional(),
            })
            .optional(),
    }),
});

export const getPlanSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const getPlanBySlugSchema = z.object({
    params: z.object({
        slug: z.string().min(1).max(50),
    }),
});

export const listPlansSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        perPage: z.string().regex(/^\d+$/).optional(),
        isActive: z.enum(['true', 'false']).optional(),
        orderBy: z.enum(['name', 'displayOrder', 'priceMonthly']).optional(),
        orderDir: z.enum(['asc', 'desc']).optional(),
    }),
});

export const toggleActiveSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        isActive: z.boolean(),
    }),
});

export const toggleFeaturedSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        isFeatured: z.boolean(),
    }),
});

export const reorderPlansSchema = z.object({
    body: z.object({
        plans: z.array(
            z.object({
                id: z.string().uuid(),
                displayOrder: z.number().min(0).max(100),
            })
        ).min(1),
    }),
});

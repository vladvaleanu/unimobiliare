/**
 * Integration Validators
 *
 * Zod schemas for integration request validation.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Source Config Schema
// ─────────────────────────────────────────────────────────────────────────────

const rateLimitSchema = z.object({
    requestsPerMinute: z.number().min(1).max(120),
    delayMs: z.number().min(500).max(10000),
});

const sourceConfigSchema = z.object({
    name: z.string().min(1),
    displayName: z.string().min(1),
    baseUrl: z.string().url(),
    type: z.enum(['html', 'api']),
    authType: z.enum(['none', 'basic', 'bearer', 'cookie']),
    authCredentials: z.record(z.string()).default({}),
    rateLimit: rateLimitSchema,
    headers: z.record(z.string()).default({}),
});

// ─────────────────────────────────────────────────────────────────────────────
// List Page Config Schema
// ─────────────────────────────────────────────────────────────────────────────

const paginationSchema = z.object({
    type: z.enum(['page', 'offset', 'cursor', 'loadMore']),
    paramName: z.string().min(1),
    startValue: z.number().min(0),
    increment: z.number().min(1),
    maxPages: z.number().min(1).max(100),
    hasNextSelector: z.string().optional(),
});

const listPageConfigSchema = z.object({
    listSelector: z.string().min(1),
    itemSelector: z.string().min(1),
    detailLinkSelector: z.string().min(1),
    pagination: paginationSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// Field Mapping Schema
// ─────────────────────────────────────────────────────────────────────────────

const transformSchema = z.object({
    type: z.enum([
        'trim',
        'regex',
        'replace',
        'parseNumber',
        'parseDate',
        'split',
        'lowercase',
        'uppercase',
        'default',
        'concat',
        'map',
    ]),
    params: z.record(z.unknown()).default({}),
});

const fieldMappingSchema = z.object({
    field: z.string().min(1),
    selector: z.string().min(1),
    selectorType: z.enum(['css', 'xpath']),
    attribute: z.string().optional(),
    transforms: z.array(transformSchema).default([]),
});

// ─────────────────────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const createIntegrationSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(3)
            .max(50)
            .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),
        displayName: z.string().min(1).max(100),
        enabled: z.boolean().default(false),
        sourceConfig: sourceConfigSchema,
        listPageConfig: listPageConfigSchema,
        fieldMappings: z.array(fieldMappingSchema).min(1),
        schedule: z.string().optional(),
    }),
});

export const updateIntegrationSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        displayName: z.string().min(1).max(100).optional(),
        enabled: z.boolean().optional(),
        sourceConfig: sourceConfigSchema.optional(),
        listPageConfig: listPageConfigSchema.optional(),
        fieldMappings: z.array(fieldMappingSchema).min(1).optional(),
        schedule: z.string().nullable().optional(),
    }),
});

export const getIntegrationSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const listIntegrationsSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        perPage: z.string().regex(/^\d+$/).optional(),
        enabled: z.enum(['true', 'false']).optional(),
        search: z.string().max(100).optional(),
        orderBy: z.enum(['name', 'createdAt', 'lastSyncAt']).optional(),
        orderDir: z.enum(['asc', 'desc']).optional(),
    }).passthrough(), // Allow additional query params
});

export const toggleEnabledSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        enabled: z.boolean(),
    }),
});

export const triggerSyncSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

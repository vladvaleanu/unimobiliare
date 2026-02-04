/**
 * Real Estate Platform Integration Configs
 * 
 * STRICT: Configuration templates for Romanian real estate platforms.
 * These configs define how to scrape listings from each platform.
 * 
 * IMPORTANT: Check Terms of Service before scraping!
 */

import { Integration } from '@prisma/client';

// ════════════════════════════════════════════════════════════════════════════════
// Type Definitions
// ════════════════════════════════════════════════════════════════════════════════

export interface SourceConfig {
    baseUrl: string;
    listUrl?: string;
    type: 'html' | 'api';
    rateLimit?: {
        delayMs: number;
        requestsPerMinute?: number;
    };
    headers?: Record<string, string>;
}

export interface ListPageConfig {
    itemSelector: string;
    detailLinkSelector: string;
    pagination?: {
        type: 'page-number' | 'load-more' | 'infinite-scroll';
        maxPages?: number;
        nextSelector?: string;
    };
}

export interface FieldMappingTransform {
    type: 'trim' | 'extractNumber' | 'extractCurrency' | 'resolveUrl' | 'regex' | 'replace' | 'default';
    options?: Record<string, unknown>;
}

export interface FieldMapping {
    field: string;
    selector: string;
    attribute?: string;
    multiple?: boolean;
    transforms?: FieldMappingTransform[];
}

export interface IntegrationConfig {
    name: string;
    displayName: string;
    enabled: boolean;
    sourceConfig: SourceConfig;
    listPageConfig: ListPageConfig;
    fieldMappings: FieldMapping[];
    schedule?: string; // Cron expression
}

// ════════════════════════════════════════════════════════════════════════════════
// Storia.ro Integration
// ════════════════════════════════════════════════════════════════════════════════

export const storiaIntegration: IntegrationConfig = {
    name: 'storia-romania',
    displayName: 'Storia.ro',
    enabled: false, // Enable after testing
    sourceConfig: {
        baseUrl: 'https://www.storia.ro',
        listUrl: '/vanzare/apartament/',
        type: 'html',
        rateLimit: { delayMs: 2000 },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
    },
    listPageConfig: {
        itemSelector: '[data-cy="listing-item"]',
        detailLinkSelector: 'a[data-cy="listing-item-link"]',
        pagination: {
            type: 'page-number',
            maxPages: 10,
        },
    },
    fieldMappings: [
        {
            field: 'title',
            selector: '[data-cy="listing-item-title"]',
            transforms: [{ type: 'trim' }],
        },
        {
            field: 'price',
            selector: '[data-cy="listing-item-price"]',
            transforms: [{ type: 'extractNumber' }],
        },
        {
            field: 'currency',
            selector: '[data-cy="listing-item-price"]',
            transforms: [{ type: 'extractCurrency' }],
        },
        {
            field: 'location.city',
            selector: '[data-cy="listing-item-location"]',
            transforms: [{ type: 'trim' }],
        },
        {
            field: 'area_sqm',
            selector: '[data-cy="listing-item-area"]',
            transforms: [{ type: 'extractNumber' }],
        },
        {
            field: 'rooms',
            selector: '[data-cy="listing-item-rooms"]',
            transforms: [{ type: 'extractNumber' }],
        },
        {
            field: 'images',
            selector: 'img[data-cy="listing-item-image"]',
            attribute: 'src',
            multiple: true,
            transforms: [{ type: 'resolveUrl' }],
        },
        {
            field: 'externalId',
            selector: '[data-cy="listing-item"]',
            attribute: 'data-id',
            transforms: [{ type: 'trim' }],
        },
    ],
    schedule: '0 */4 * * *', // Every 4 hours
};

// ════════════════════════════════════════════════════════════════════════════════
// Imobiliare.ro Integration
// ════════════════════════════════════════════════════════════════════════════════

export const imobiliareRoIntegration: IntegrationConfig = {
    name: 'imobiliare-ro',
    displayName: 'Imobiliare.ro',
    enabled: false,
    sourceConfig: {
        baseUrl: 'https://www.imobiliare.ro',
        listUrl: '/vanzari-apartamente/bucuresti',
        type: 'html',
        rateLimit: { delayMs: 3000 }, // More conservative due to anti-bot
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
    },
    listPageConfig: {
        itemSelector: '.box-anunt',
        detailLinkSelector: '.box-anunt a.titlu',
        pagination: {
            type: 'page-number',
            maxPages: 5,
        },
    },
    fieldMappings: [
        {
            field: 'title',
            selector: '.titlu-anunt',
            transforms: [{ type: 'trim' }],
        },
        {
            field: 'price',
            selector: '.pret',
            transforms: [{ type: 'extractNumber' }],
        },
        {
            field: 'currency',
            selector: '.pret',
            transforms: [{ type: 'extractCurrency' }],
        },
        {
            field: 'location.city',
            selector: '.localizare',
            transforms: [{ type: 'trim' }],
        },
        {
            field: 'area_sqm',
            selector: '.caracteristici-anunt span:contains("mp")',
            transforms: [{ type: 'extractNumber' }],
        },
        {
            field: 'rooms',
            selector: '.caracteristici-anunt span:contains("camere")',
            transforms: [{ type: 'extractNumber' }],
        },
        {
            field: 'images',
            selector: '.imagine-anunt img',
            attribute: 'src',
            multiple: true,
            transforms: [{ type: 'resolveUrl' }],
        },
        {
            field: 'externalId',
            selector: '.box-anunt',
            attribute: 'data-id',
        },
    ],
    schedule: '0 */6 * * *', // Every 6 hours
};

// ════════════════════════════════════════════════════════════════════════════════
// OLX Romania Integration  
// ════════════════════════════════════════════════════════════════════════════════

export const olxRomaniaIntegration: IntegrationConfig = {
    name: 'olx-romania',
    displayName: 'OLX România',
    enabled: false,
    sourceConfig: {
        baseUrl: 'https://www.olx.ro',
        listUrl: '/imobiliare/apartamente-garsoniere-de-vanzare/',
        type: 'html',
        rateLimit: { delayMs: 5000 }, // OLX has aggressive rate limiting
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
    },
    listPageConfig: {
        itemSelector: '[data-cy="l-card"]',
        detailLinkSelector: 'a[data-cy="l-card"]',
        pagination: {
            type: 'page-number',
            maxPages: 5,
        },
    },
    fieldMappings: [
        {
            field: 'title',
            selector: '[data-cy="ad-title"]',
            transforms: [{ type: 'trim' }],
        },
        {
            field: 'price',
            selector: '[data-cy="ad-price"]',
            transforms: [{ type: 'extractNumber' }],
        },
        {
            field: 'currency',
            selector: '[data-cy="ad-price"]',
            transforms: [{ type: 'extractCurrency' }],
        },
        {
            field: 'location.city',
            selector: '[data-testid="location-date"]',
            transforms: [{ type: 'trim' }],
        },
        {
            field: 'images',
            selector: 'img[data-testid="ad-photo"]',
            attribute: 'src',
            multiple: true,
            transforms: [{ type: 'resolveUrl' }],
        },
        {
            field: 'externalId',
            selector: '[data-cy="l-card"]',
            attribute: 'id',
        },
    ],
    schedule: '0 */8 * * *', // Every 8 hours (conservative due to rate limits)
};

// ════════════════════════════════════════════════════════════════════════════════
// Publi24 Integration  
// ════════════════════════════════════════════════════════════════════════════════

export const publi24Integration: IntegrationConfig = {
    name: 'publi24-romania',
    displayName: 'Publi24',
    enabled: false,
    sourceConfig: {
        baseUrl: 'https://www.publi24.ro',
        listUrl: '/anunturi/imobiliare/de-vanzare/apartamente/',
        type: 'html',
        rateLimit: { delayMs: 2000 },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
    },
    listPageConfig: {
        itemSelector: '.listing-item',
        detailLinkSelector: '.listing-item a.title',
        pagination: {
            type: 'page-number',
            maxPages: 10,
        },
    },
    fieldMappings: [
        {
            field: 'title',
            selector: '.listing-title',
            transforms: [{ type: 'trim' }],
        },
        {
            field: 'price',
            selector: '.listing-price',
            transforms: [{ type: 'extractNumber' }],
        },
        {
            field: 'currency',
            selector: '.listing-price',
            transforms: [{ type: 'extractCurrency' }],
        },
        {
            field: 'location.city',
            selector: '.listing-location',
            transforms: [{ type: 'trim' }],
        },
        {
            field: 'images',
            selector: '.listing-image img',
            attribute: 'src',
            multiple: true,
            transforms: [{ type: 'resolveUrl' }],
        },
        {
            field: 'externalId',
            selector: '.listing-item',
            attribute: 'data-listing-id',
        },
    ],
    schedule: '0 */4 * * *',
};

// ════════════════════════════════════════════════════════════════════════════════
// Export All Integrations  
// ════════════════════════════════════════════════════════════════════════════════

export const allIntegrations: IntegrationConfig[] = [
    storiaIntegration,
    imobiliareRoIntegration,
    olxRomaniaIntegration,
    publi24Integration,
];

export default allIntegrations;

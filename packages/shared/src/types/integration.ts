import type { SyncStatus } from '../constants/status.js';

/**
 * Source configuration for an integration
 */
export interface SourceConfig {
    baseUrl: string;
    type: 'html' | 'api';
    auth: {
        type: 'none' | 'basic' | 'bearer' | 'cookie';
        credentials?: Record<string, string>;
    };
    rateLimit: {
        requestsPerMinute: number;
        delayMs: number;
    };
    headers?: Record<string, string>;
}

/**
 * Field mapping for scraping
 */
export interface FieldMapping {
    field: string;
    selector: string;
    selectorType: 'css' | 'xpath';
    attribute?: string;
    transforms: TransformConfig[];
}

/**
 * Transform configuration
 */
export interface TransformConfig {
    type: 'trim' | 'extractNumber' | 'extractCurrency' | 'resolveUrl' | 'regex' | 'replace' | 'split' | 'default';
    params?: Record<string, unknown>;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
    type: 'page' | 'offset' | 'cursor' | 'loadMore';
    paramName: string;
    startValue: number;
    increment: number;
    maxPages: number;
    hasNextSelector?: string;
}

/**
 * Integration entity
 */
export interface Integration {
    id: string;
    name: string;
    displayName: string;
    enabled: boolean;
    sourceConfig: SourceConfig;
    listPageConfig: {
        listSelector: string;
        itemSelector: string;
        detailLinkSelector: string;
        pagination: PaginationConfig;
    };
    fieldMappings: FieldMapping[];
    schedule: string | null;
    lastSyncAt: Date | null;
    lastSyncStatus: SyncStatus;
    lastSyncError: string | null;
    listingsCount: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Integration creation/update input
 */
export interface IntegrationInput {
    name: string;
    displayName: string;
    enabled?: boolean;
    sourceConfig: SourceConfig;
    listPageConfig: Integration['listPageConfig'];
    fieldMappings: FieldMapping[];
    schedule?: string | null;
}

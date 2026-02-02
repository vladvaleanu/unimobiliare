/**
 * Integration Builder Service
 * 
 * API calls for No-Code Integration Builder
 */

import { apiClient } from './api';

export interface SelectorTestResult {
    found: boolean;
    count: number;
    samples: string[];
    error?: string;
}

export interface FieldExtraction {
    field: string;
    selector: string;
    value: string | string[] | null;
    error?: string;
}

export interface PagePreview {
    url: string;
    title: string;
    success: boolean;
    extractions: FieldExtraction[];
    error?: string;
}

export interface TransformConfig {
    type: 'trim' | 'extractNumber' | 'extractCurrency' | 'resolveUrl' | 'regex' | 'replace' | 'default';
    options?: Record<string, any>;
}

export interface FieldMapping {
    field: string;
    selector: string;
    attribute?: string;
    multiple?: boolean;
    transforms?: TransformConfig[];
}

export const integrationBuilderService = {
    async testSelector(url: string, selector: string) {
        return apiClient.post<{ success: boolean; data: SelectorTestResult }>(
            '/integrations/builder/test-selector',
            { url, selector }
        );
    },

    async previewExtraction(url: string, fieldMappings: FieldMapping[]) {
        return apiClient.post<{ success: boolean; data: PagePreview }>(
            '/integrations/builder/preview',
            { url, fieldMappings }
        );
    },

    async fetchPage(url: string) {
        return apiClient.post<{ success: boolean; data: { html: string; status: number; length: number } }>(
            '/integrations/builder/fetch-page',
            { url }
        );
    },

    async batchTest(urls: string[], fieldMappings: FieldMapping[]) {
        return apiClient.post<{ success: boolean; data: { tested: number; results: PagePreview[] } }>(
            '/integrations/builder/batch-test',
            { urls, fieldMappings }
        );
    },
};

/**
 * Integrations Service
 * 
 * API calls for integration management in admin panel.
 * Connects to backend /api/v1/integrations endpoints.
 */

import { apiClient } from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Integration {
    id: string;
    name: string;
    displayName: string;
    enabled: boolean;
    sourceConfig: Record<string, unknown>;
    listPageConfig: Record<string, unknown> | null;
    fieldMappings: Record<string, unknown>[] | null;
    schedule: string | null;
    lastSyncAt: string | null;
    lastSyncStatus: 'idle' | 'running' | 'success' | 'failed';
    totalListings: number;
    createdAt: string;
    updatedAt: string;
}

export interface IntegrationListResponse {
    success: boolean;
    data: Integration[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
}

export interface IntegrationResponse {
    success: boolean;
    data: Integration;
    message?: string;
}

export interface CreateIntegrationInput {
    name: string;
    displayName: string;
    enabled?: boolean;
    sourceConfig: Record<string, unknown>;
    listPageConfig?: Record<string, unknown>;
    fieldMappings?: Record<string, unknown>[];
    schedule?: string;
}

export interface UpdateIntegrationInput {
    displayName?: string;
    enabled?: boolean;
    sourceConfig?: Record<string, unknown>;
    listPageConfig?: Record<string, unknown>;
    fieldMappings?: Record<string, unknown>[];
    schedule?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const integrationsService = {
    /**
     * Get all integrations with optional filtering
     */
    async getAll(options?: {
        page?: number;
        perPage?: number;
        enabled?: boolean;
        search?: string;
    }): Promise<IntegrationListResponse> {
        const params = new URLSearchParams();
        if (options?.page) params.append('page', options.page.toString());
        if (options?.perPage) params.append('perPage', options.perPage.toString());
        if (options?.enabled !== undefined) params.append('enabled', options.enabled.toString());
        if (options?.search) params.append('search', options.search);

        const query = params.toString();
        const response = await apiClient.get<IntegrationListResponse>(`/integrations${query ? `?${query}` : ''}`);
        return response.data;
    },

    /**
     * Get single integration by ID
     */
    async getById(id: string): Promise<IntegrationResponse> {
        const response = await apiClient.get<IntegrationResponse>(`/integrations/${id}`);
        return response.data;
    },

    /**
     * Create a new integration
     */
    async create(input: CreateIntegrationInput): Promise<IntegrationResponse> {
        const response = await apiClient.post<IntegrationResponse>('/integrations', input);
        return response.data;
    },

    /**
     * Update an existing integration
     */
    async update(id: string, input: UpdateIntegrationInput): Promise<IntegrationResponse> {
        const response = await apiClient.put<IntegrationResponse>(`/integrations/${id}`, input);
        return response.data;
    },

    /**
     * Delete an integration
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/integrations/${id}`);
    },

    /**
     * Toggle integration enabled/disabled
     */
    async toggleEnabled(id: string, enabled: boolean): Promise<IntegrationResponse> {
        const response = await apiClient.patch<IntegrationResponse>(`/integrations/${id}/toggle`, { enabled });
        return response.data;
    },

    /**
     * Trigger manual sync for an integration
     */
    async triggerSync(id: string): Promise<IntegrationResponse> {
        const response = await apiClient.post<IntegrationResponse>(`/integrations/${id}/sync`);
        return response.data;
    },
};

export default integrationsService;

/**
 * AI Service (Admin)
 * 
 * API calls for AI Gateway functionality in admin panel
 */

import { apiClient } from './api';

export interface AIHealthResponse {
    ollama: {
        available: boolean;
        models: string[];
    };
    openai: {
        available: boolean;
    };
    anthropic: {
        available: boolean;
    };
}

export interface FeatureExtractionResult {
    features: string[];
    amenities: string[];
    condition: string;
    highlights: string[];
}

export interface FraudDetectionResult {
    score: number;
    reasons: string[];
    recommendation: 'approve' | 'review' | 'reject';
}

export const aiService = {
    async getHealth() {
        return apiClient.get<{ success: boolean; data: AIHealthResponse }>('/ai/health');
    },

    async extractFeatures(description: string) {
        return apiClient.post<{ success: boolean; data: FeatureExtractionResult }>(
            '/ai/extract-features',
            { description }
        );
    },

    async detectFraud(listing: {
        title: string;
        description: string;
        price: number;
        images?: string[];
    }) {
        return apiClient.post<{ success: boolean; data: FraudDetectionResult }>(
            '/ai/detect-fraud',
            listing
        );
    },

    async generateEmbeddings(texts: string[]) {
        return apiClient.post<{
            success: boolean;
            data: {
                embeddings: number[][];
                provider: string;
                model: string;
            };
        }>('/ai/embed', { texts });
    },

    async generate(params: {
        task: string;
        prompt: string;
        systemPrompt?: string;
        temperature?: number;
        maxTokens?: number;
    }) {
        return apiClient.post<{
            success: boolean;
            data: {
                content: string;
                provider: string;
                model: string;
                usage?: {
                    promptTokens: number;
                    completionTokens: number;
                    totalTokens: number;
                };
                duration: number;
            };
        }>('/ai/generate', params);
    },
};

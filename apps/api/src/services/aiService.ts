/**
 * AI Service
 * 
 * Multi-model AI Gateway supporting:
 * - Ollama (local) - primary
 * - OpenAI (cloud) - fallback
 * - Anthropic (cloud) - fallback
 * 
 * Per-task model configuration as specified in spec_tehnice.txt
 */

import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AIConfig {
    providers: {
        ollama?: {
            baseUrl: string;
            enabled: boolean;
        };
        openai?: {
            apiKey: string;
            enabled: boolean;
        };
        anthropic?: {
            apiKey: string;
            enabled: boolean;
        };
    };
    taskModels: Record<AITask, ModelConfig>;
}

export interface ModelConfig {
    provider: 'ollama' | 'openai' | 'anthropic';
    model: string;
    fallback?: {
        provider: 'openai' | 'anthropic';
        model: string;
    };
}

export type AITask =
    | 'feature_extraction'
    | 'text_summarization'
    | 'deduplication'
    | 'fraud_detection'
    | 'chatbot'
    | 'image_analysis'
    | 'embedding';

export interface AIRequest {
    task: AITask;
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface AIResponse {
    success: boolean;
    content: string;
    provider: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    error?: string;
    duration: number;
}

export interface EmbeddingRequest {
    text: string | string[];
}

export interface EmbeddingResponse {
    success: boolean;
    embeddings: number[][];
    provider: string;
    model: string;
    error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Configuration
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: AIConfig = {
    providers: {
        ollama: {
            baseUrl: process.env['OLLAMA_URL'] || 'http://localhost:11434',
            enabled: true,
        },
        openai: {
            apiKey: process.env['OPENAI_API_KEY'] || '',
            enabled: !!process.env['OPENAI_API_KEY'],
        },
        anthropic: {
            apiKey: process.env['ANTHROPIC_API_KEY'] || '',
            enabled: !!process.env['ANTHROPIC_API_KEY'],
        },
    },
    taskModels: {
        feature_extraction: {
            provider: 'ollama',
            model: 'llama3:8b',
            fallback: { provider: 'openai', model: 'gpt-3.5-turbo' },
        },
        text_summarization: {
            provider: 'ollama',
            model: 'llama3:8b',
            fallback: { provider: 'openai', model: 'gpt-3.5-turbo' },
        },
        deduplication: {
            provider: 'ollama',
            model: 'nomic-embed-text',
            fallback: { provider: 'openai', model: 'text-embedding-3-small' },
        },
        fraud_detection: {
            provider: 'ollama',
            model: 'llama3:8b',
            fallback: { provider: 'openai', model: 'gpt-4' },
        },
        chatbot: {
            provider: 'openai',
            model: 'gpt-4',
        },
        image_analysis: {
            provider: 'ollama',
            model: 'llava:13b',
            fallback: { provider: 'openai', model: 'gpt-4-vision-preview' },
        },
        embedding: {
            provider: 'ollama',
            model: 'nomic-embed-text',
            fallback: { provider: 'openai', model: 'text-embedding-3-small' },
        },
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// AI Service Class
// ─────────────────────────────────────────────────────────────────────────────

export class AIService {
    private config: AIConfig;

    constructor(config: Partial<AIConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Generate text using the appropriate model for the task
     */
    async generate(request: AIRequest): Promise<AIResponse> {
        const startTime = Date.now();
        const modelConfig = this.config.taskModels[request.task];

        // Try primary provider
        try {
            const response = await this.callProvider(modelConfig.provider, modelConfig.model, request);
            return { ...response, duration: Date.now() - startTime };
        } catch (error: any) {
            console.error(`Primary provider ${modelConfig.provider} failed:`, error.message);

            // Try fallback if available
            if (modelConfig.fallback) {
                try {
                    console.log(`Trying fallback: ${modelConfig.fallback.provider}/${modelConfig.fallback.model}`);
                    const response = await this.callProvider(
                        modelConfig.fallback.provider,
                        modelConfig.fallback.model,
                        request
                    );
                    return { ...response, duration: Date.now() - startTime };
                } catch (fallbackError: any) {
                    return {
                        success: false,
                        content: '',
                        provider: modelConfig.fallback.provider,
                        model: modelConfig.fallback.model,
                        error: `All providers failed: ${error.message}, ${fallbackError.message}`,
                        duration: Date.now() - startTime,
                    };
                }
            }

            return {
                success: false,
                content: '',
                provider: modelConfig.provider,
                model: modelConfig.model,
                error: error.message,
                duration: Date.now() - startTime,
            };
        }
    }

    /**
     * Generate embeddings for deduplication
     */
    async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
        const modelConfig = this.config.taskModels['embedding'];
        const texts = Array.isArray(request.text) ? request.text : [request.text];

        try {
            if (modelConfig.provider === 'ollama') {
                return await this.ollamaEmbed(modelConfig.model, texts);
            } else if (modelConfig.provider === 'openai') {
                return await this.openaiEmbed(modelConfig.model, texts);
            }
            throw new Error(`Unsupported embedding provider: ${modelConfig.provider}`);
        } catch (error: any) {
            // Try fallback
            if (modelConfig.fallback) {
                try {
                    if (modelConfig.fallback.provider === 'openai') {
                        return await this.openaiEmbed(modelConfig.fallback.model, texts);
                    }
                } catch { }
            }
            return {
                success: false,
                embeddings: [],
                provider: modelConfig.provider,
                model: modelConfig.model,
                error: error.message,
            };
        }
    }

    /**
     * Extract features from property description
     */
    async extractFeatures(description: string): Promise<{
        features: string[];
        amenities: string[];
        condition: string;
        highlights: string[];
    }> {
        const response = await this.generate({
            task: 'feature_extraction',
            systemPrompt: `You are a real estate feature extraction AI. Extract structured data from property descriptions.
            Response format (JSON only):
            {
                "features": ["balcony", "parking", "elevator"],
                "amenities": ["AC", "central heating", "internet"],
                "condition": "renovated" | "new" | "good" | "needs renovation" | "unknown",
                "highlights": ["quiet neighborhood", "close to metro"]
            }`,
            prompt: description,
            temperature: 0.1,
        });

        if (!response.success) {
            return { features: [], amenities: [], condition: 'unknown', highlights: [] };
        }

        try {
            return JSON.parse(response.content);
        } catch {
            return { features: [], amenities: [], condition: 'unknown', highlights: [] };
        }
    }

    /**
     * Detect potential fraud in listing
     */
    async detectFraud(listing: {
        title: string;
        description: string;
        price: number;
        images: string[];
    }): Promise<{
        score: number; // 0-100, higher = more suspicious
        reasons: string[];
        recommendation: 'approve' | 'review' | 'reject';
    }> {
        const response = await this.generate({
            task: 'fraud_detection',
            systemPrompt: `You are a fraud detection AI for real estate listings.
            Analyze the listing for potential fraud indicators:
            - Unrealistically low prices
            - Generic/stock photo descriptions
            - Urgency language ("sell fast", "leaving country")
            - Missing contact details
            - Inconsistencies in details
            
            Response format (JSON only):
            {
                "score": 0-100,
                "reasons": ["reason1", "reason2"],
                "recommendation": "approve" | "review" | "reject"
            }`,
            prompt: JSON.stringify(listing),
            temperature: 0.2,
        });

        if (!response.success) {
            return { score: 50, reasons: ['AI analysis failed'], recommendation: 'review' };
        }

        try {
            return JSON.parse(response.content);
        } catch {
            return { score: 50, reasons: ['Failed to parse AI response'], recommendation: 'review' };
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Provider Implementations
    // ─────────────────────────────────────────────────────────────────────────

    private async callProvider(
        provider: 'ollama' | 'openai' | 'anthropic',
        model: string,
        request: AIRequest
    ): Promise<AIResponse> {
        switch (provider) {
            case 'ollama':
                return this.callOllama(model, request);
            case 'openai':
                return this.callOpenAI(model, request);
            case 'anthropic':
                return this.callAnthropic(model, request);
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }

    private async callOllama(model: string, request: AIRequest): Promise<AIResponse> {
        const { baseUrl } = this.config.providers.ollama!;

        const response = await axios.post(
            `${baseUrl}/api/generate`,
            {
                model,
                prompt: request.prompt,
                system: request.systemPrompt,
                stream: false,
                options: {
                    temperature: request.temperature ?? 0.7,
                    num_predict: request.maxTokens ?? 2048,
                },
            },
            { timeout: 120000 }
        );

        return {
            success: true,
            content: response.data.response,
            provider: 'ollama',
            model,
            usage: {
                promptTokens: response.data.prompt_eval_count || 0,
                completionTokens: response.data.eval_count || 0,
                totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0),
            },
            duration: 0,
        };
    }

    private async callOpenAI(model: string, request: AIRequest): Promise<AIResponse> {
        const { apiKey } = this.config.providers.openai!;

        const messages = [];
        if (request.systemPrompt) {
            messages.push({ role: 'system', content: request.systemPrompt });
        }
        messages.push({ role: 'user', content: request.prompt });

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model,
                messages,
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens ?? 2048,
            },
            {
                headers: { Authorization: `Bearer ${apiKey}` },
                timeout: 60000,
            }
        );

        return {
            success: true,
            content: response.data.choices[0].message.content,
            provider: 'openai',
            model,
            usage: {
                promptTokens: response.data.usage.prompt_tokens,
                completionTokens: response.data.usage.completion_tokens,
                totalTokens: response.data.usage.total_tokens,
            },
            duration: 0,
        };
    }

    private async callAnthropic(model: string, request: AIRequest): Promise<AIResponse> {
        const { apiKey } = this.config.providers.anthropic!;

        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model,
                max_tokens: request.maxTokens ?? 2048,
                system: request.systemPrompt,
                messages: [{ role: 'user', content: request.prompt }],
            },
            {
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                timeout: 60000,
            }
        );

        return {
            success: true,
            content: response.data.content[0].text,
            provider: 'anthropic',
            model,
            usage: {
                promptTokens: response.data.usage.input_tokens,
                completionTokens: response.data.usage.output_tokens,
                totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens,
            },
            duration: 0,
        };
    }

    private async ollamaEmbed(model: string, texts: string[]): Promise<EmbeddingResponse> {
        const { baseUrl } = this.config.providers.ollama!;
        const embeddings: number[][] = [];

        for (const text of texts) {
            const response = await axios.post(
                `${baseUrl}/api/embeddings`,
                { model, prompt: text },
                { timeout: 30000 }
            );
            embeddings.push(response.data.embedding);
        }

        return {
            success: true,
            embeddings,
            provider: 'ollama',
            model,
        };
    }

    private async openaiEmbed(model: string, texts: string[]): Promise<EmbeddingResponse> {
        const { apiKey } = this.config.providers.openai!;

        const response = await axios.post(
            'https://api.openai.com/v1/embeddings',
            { model, input: texts },
            {
                headers: { Authorization: `Bearer ${apiKey}` },
                timeout: 30000,
            }
        );

        return {
            success: true,
            embeddings: response.data.data.map((d: any) => d.embedding),
            provider: 'openai',
            model,
        };
    }

    /**
     * Check if Ollama is available
     */
    async checkOllamaHealth(): Promise<boolean> {
        try {
            const { baseUrl } = this.config.providers.ollama!;
            await axios.get(`${baseUrl}/api/tags`, { timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * List available Ollama models
     */
    async listOllamaModels(): Promise<string[]> {
        try {
            const { baseUrl } = this.config.providers.ollama!;
            const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 5000 });
            return response.data.models?.map((m: any) => m.name) || [];
        } catch {
            return [];
        }
    }
}

// Singleton instance
export const aiService = new AIService();

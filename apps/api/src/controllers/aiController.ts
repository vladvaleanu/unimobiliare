/**
 * AI Controller
 * 
 * API endpoints for AI functionality:
 * - Health check
 * - Feature extraction
 * - Fraud detection
 * - Embeddings for deduplication
 */

import type { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/aiService';

/**
 * GET /api/v1/ai/health
 * Check AI service health and available models
 */
export async function healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const ollamaAvailable = await aiService.checkOllamaHealth();
        const models = ollamaAvailable ? await aiService.listOllamaModels() : [];

        res.json({
            success: true,
            data: {
                ollama: {
                    available: ollamaAvailable,
                    models,
                },
                openai: {
                    available: !!process.env['OPENAI_API_KEY'],
                },
                anthropic: {
                    available: !!process.env['ANTHROPIC_API_KEY'],
                },
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/v1/ai/extract-features
 * Extract features from property description
 */
export async function extractFeatures(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { description } = req.body;

        if (!description) {
            res.status(400).json({
                success: false,
                error: { message: 'Description is required' },
            });
            return;
        }

        const result = await aiService.extractFeatures(description);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/v1/ai/detect-fraud
 * Analyze listing for fraud indicators
 */
export async function detectFraud(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { title, description, price, images = [] } = req.body;

        if (!title || !description || price === undefined) {
            res.status(400).json({
                success: false,
                error: { message: 'title, description, and price are required' },
            });
            return;
        }

        const result = await aiService.detectFraud({ title, description, price, images });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/v1/ai/embed
 * Generate embeddings for texts (for deduplication)
 */
export async function generateEmbeddings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { texts } = req.body;

        if (!texts || (Array.isArray(texts) && texts.length === 0)) {
            res.status(400).json({
                success: false,
                error: { message: 'texts array is required' },
            });
            return;
        }

        const result = await aiService.embed({ text: texts });

        res.json({
            success: true,
            data: {
                embeddings: result.embeddings,
                provider: result.provider,
                model: result.model,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/v1/ai/generate
 * General-purpose AI generation
 */
export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { task, prompt, systemPrompt, temperature, maxTokens } = req.body;

        if (!task || !prompt) {
            res.status(400).json({
                success: false,
                error: { message: 'task and prompt are required' },
            });
            return;
        }

        const validTasks = [
            'feature_extraction',
            'text_summarization',
            'deduplication',
            'fraud_detection',
            'chatbot',
            'image_analysis',
        ];

        if (!validTasks.includes(task)) {
            res.status(400).json({
                success: false,
                error: { message: `Invalid task. Must be one of: ${validTasks.join(', ')}` },
            });
            return;
        }

        const result = await aiService.generate({
            task,
            prompt,
            systemPrompt,
            temperature,
            maxTokens,
        });

        res.json({
            success: result.success,
            data: {
                content: result.content,
                provider: result.provider,
                model: result.model,
                usage: result.usage,
                duration: result.duration,
            },
            error: result.error ? { message: result.error } : undefined,
        });
    } catch (error) {
        next(error);
    }
}

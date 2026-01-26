import { z } from 'zod';

/**
 * Environment variables schema
 * All env vars are validated at startup
 */
const envSchema = z.object({
    // App
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3000'),
    APP_URL: z.string().url().default('http://localhost:3000'),

    // Database
    DATABASE_URL: z.string(),

    // Redis
    REDIS_URL: z.string().default('redis://localhost:6379'),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),

    // Stripe
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // AI - Ollama
    OLLAMA_BASE_URL: z.string().url().optional(),

    // AI - OpenAI
    OPENAI_API_KEY: z.string().optional(),

    // Meilisearch
    MEILISEARCH_HOST: z.string().url().optional(),
    MEILISEARCH_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function loadEnv(): Env {
    if (env) return env;

    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        console.error(result.error.format());
        process.exit(1);
    }

    env = result.data;
    return env;
}

export function getEnv(): Env {
    if (!env) {
        throw new Error('Environment not loaded. Call loadEnv() first.');
    }
    return env;
}

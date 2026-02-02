/**
 * Unimobiliare Background Worker
 *
 * Processes background jobs:
 * - Scraping integrations
 * - AI processing
 * - Email notifications
 * - Data cleanup
 */

import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import axios from 'axios';
import * as cheerio from 'cheerio';

const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
});

console.log('🔧 Starting Unimobiliare Worker...');
console.log(`📡 Connecting to Redis: ${REDIS_URL}`);

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

const QUEUE_NAMES = {
    SCRAPING: 'scraping',
    AI_PROCESSING: 'ai-processing',
    NOTIFICATIONS: 'notifications',
    CLEANUP: 'cleanup',
} as const;

interface ScrapingJobData {
    integrationId: string;
    type: 'full_sync' | 'incremental' | 'single_url';
    url?: string;
    priority?: number;
    metadata?: Record<string, unknown>;
}

interface ScrapingJobResult {
    success: boolean;
    itemsProcessed: number;
    itemsCreated: number;
    itemsUpdated: number;
    errors: string[];
    duration: number;
}

interface Integration {
    id: string;
    name: string;
    displayName: string;
    sourceConfig: {
        baseUrl: string;
        listUrl?: string;
        rateLimit?: { delayMs: number };
    };
    fieldMappings: {
        field: string;
        selector: string;
        attribute?: string;
        transforms?: { type: string; options?: Record<string, any> }[];
    }[];
    listPageConfig?: {
        itemSelector: string;
        detailLinkSelector: string;
        pagination?: { maxPages: number };
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scraping Processor
// ─────────────────────────────────────────────────────────────────────────────

async function processScrapingJob(job: Job<ScrapingJobData>): Promise<ScrapingJobResult> {
    const startTime = Date.now();
    const { integrationId, type, url } = job.data;
    const errors: string[] = [];
    let itemsProcessed = 0;
    let itemsCreated = 0;
    let itemsUpdated = 0;

    console.log(`🔍 Processing ${type} job for integration: ${integrationId}`);
    await job.updateProgress(5);

    try {
        // Fetch integration config from API
        const integration = await fetchIntegration(integrationId);
        if (!integration) {
            throw new Error(`Integration ${integrationId} not found`);
        }

        await job.updateProgress(10);

        switch (type) {
            case 'single_url':
                if (!url) throw new Error('URL required for single_url type');
                const result = await scrapeSingleUrl(integration, url);
                if (result.success) {
                    itemsCreated = 1;
                    itemsProcessed = 1;
                } else {
                    errors.push(result.error || 'Unknown error');
                }
                break;

            case 'incremental':
            case 'full_sync':
                const syncResult = await scrapeListings(integration, job, type === 'full_sync');
                itemsProcessed = syncResult.processed;
                itemsCreated = syncResult.created;
                itemsUpdated = syncResult.updated;
                errors.push(...syncResult.errors);
                break;
        }

        await job.updateProgress(100);
    } catch (error: any) {
        errors.push(error.message);
        console.error(`❌ Job failed: ${error.message}`);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Job completed in ${duration}ms: ${itemsProcessed} processed, ${itemsCreated} created, ${itemsUpdated} updated`);

    return {
        success: errors.length === 0,
        itemsProcessed,
        itemsCreated,
        itemsUpdated,
        errors,
        duration,
    };
}

async function fetchIntegration(integrationId: string): Promise<Integration | null> {
    try {
        // In production, this would call the API with proper auth
        // For now, we mock it or call internal service
        const response = await axios.get(`${API_URL}/api/v1/integrations/${integrationId}`, {
            headers: { 'X-Internal-Worker': 'true' },
            timeout: 10000,
        });
        return response.data.data;
    } catch {
        console.error(`Failed to fetch integration ${integrationId}`);
        return null;
    }
}

async function scrapeSingleUrl(
    integration: Integration,
    url: string
): Promise<{ success: boolean; data?: Record<string, any>; error?: string }> {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 Unimobiliare Bot/1.0' },
            timeout: 30000,
        });

        const $ = cheerio.load(response.data);
        const data: Record<string, any> = {};

        for (const mapping of integration.fieldMappings) {
            const elements = $(mapping.selector);
            if (elements.length > 0) {
                let value: string;
                if (mapping.attribute === 'href') {
                    value = elements.first().attr('href') || '';
                } else if (mapping.attribute === 'src') {
                    value = elements.first().attr('src') || '';
                } else {
                    value = elements.first().text().trim();
                }

                // Apply transforms
                if (mapping.transforms) {
                    value = applyTransforms(value, mapping.transforms, url);
                }

                data[mapping.field] = value;
            }
        }

        // Save to database via API
        await axios.post(`${API_URL}/api/v1/listings`, {
            integrationId: integration.id,
            externalId: data['externalId'] || url,
            ...data,
        }, {
            headers: { 'X-Internal-Worker': 'true' },
        });

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

async function scrapeListings(
    integration: Integration,
    job: Job,
    fullSync: boolean
): Promise<{ processed: number; created: number; updated: number; errors: string[] }> {
    const result = { processed: 0, created: 0, updated: 0, errors: [] as string[] };

    const listUrl = integration.sourceConfig.listUrl || integration.sourceConfig.baseUrl;
    const maxPages = fullSync ? (integration.listPageConfig?.pagination?.maxPages || 5) : 2;
    const delayMs = integration.sourceConfig.rateLimit?.delayMs || 2000;

    for (let page = 1; page <= maxPages; page++) {
        try {
            await job.updateProgress(10 + (page / maxPages) * 80);

            const pageUrl = `${listUrl}?page=${page}`;
            console.log(`📄 Scraping page ${page}: ${pageUrl}`);

            const response = await axios.get(pageUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 Unimobiliare Bot/1.0' },
                timeout: 30000,
            });

            const $ = cheerio.load(response.data);
            const itemSelector = integration.listPageConfig?.itemSelector || 'article';
            const items = $(itemSelector);

            if (items.length === 0) {
                console.log(`No more items found on page ${page}`);
                break;
            }

            for (let i = 0; i < items.length; i++) {
                const item = items.eq(i);
                const linkSelector = integration.listPageConfig?.detailLinkSelector || 'a';
                const href = item.find(linkSelector).attr('href');

                if (href) {
                    const detailUrl = href.startsWith('http') ? href : new URL(href, listUrl).href;

                    try {
                        const scrapeResult = await scrapeSingleUrl(integration, detailUrl);
                        if (scrapeResult.success) {
                            result.created++;
                        } else {
                            result.errors.push(`${detailUrl}: ${scrapeResult.error}`);
                        }
                        result.processed++;

                        // Rate limiting
                        await new Promise(r => setTimeout(r, delayMs));
                    } catch (e: any) {
                        result.errors.push(`${detailUrl}: ${e.message}`);
                    }
                }
            }
        } catch (error: any) {
            result.errors.push(`Page ${page}: ${error.message}`);
        }
    }

    return result;
}

function applyTransforms(
    value: string,
    transforms: { type: string; options?: Record<string, any> }[],
    baseUrl: string
): string {
    let result = value;

    for (const transform of transforms) {
        switch (transform.type) {
            case 'trim':
                result = result.trim();
                break;
            case 'extractNumber':
            case 'parseNumber':
                result = result.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
                break;
            case 'extractCurrency':
                if (result.includes('EUR') || result.includes('€')) result = 'EUR';
                else if (result.includes('RON') || result.includes('lei')) result = 'RON';
                break;
            case 'resolveUrl':
                if (!result.startsWith('http')) {
                    try {
                        result = new URL(result, baseUrl).href;
                    } catch { }
                }
                break;
        }
    }

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Worker Setup
// ─────────────────────────────────────────────────────────────────────────────

const scrapingWorker = new Worker<ScrapingJobData, ScrapingJobResult>(
    QUEUE_NAMES.SCRAPING,
    processScrapingJob,
    {
        connection,
        concurrency: 2, // Process 2 jobs at a time
        limiter: {
            max: 10,
            duration: 60000, // Max 10 jobs per minute
        },
    }
);

scrapingWorker.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed:`, result);
});

scrapingWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

scrapingWorker.on('progress', (job, progress) => {
    console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

console.log('✅ Worker started and listening for jobs');

// ─────────────────────────────────────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────────────────────────────────────

const shutdown = async () => {
    console.log('Shutting down worker...');
    await scrapingWorker.close();
    await connection.quit();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

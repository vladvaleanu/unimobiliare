/**
 * Scraping Queue Service
 * 
 * Manages job queues for scraping integrations.
 * Uses BullMQ for reliable job processing.
 */

import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379';

const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
});

export const QUEUE_NAMES = {
    SCRAPING: 'scraping',
    AI_PROCESSING: 'ai-processing',
    NOTIFICATIONS: 'notifications',
    CLEANUP: 'cleanup',
} as const;

export interface ScrapingJobData {
    integrationId: string;
    type: 'full_sync' | 'incremental' | 'single_url';
    url?: string;
    priority?: number;
    metadata?: Record<string, unknown>;
}

export interface ScrapingJobResult {
    success: boolean;
    itemsProcessed: number;
    itemsCreated: number;
    itemsUpdated: number;
    errors: string[];
    duration: number;
}

class ScrapingQueueService {
    private queue: Queue<ScrapingJobData, ScrapingJobResult>;
    private events: QueueEvents;

    constructor() {
        this.queue = new Queue<ScrapingJobData, ScrapingJobResult>(QUEUE_NAMES.SCRAPING, {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: {
                    count: 1000, // Keep last 1000 completed jobs
                },
                removeOnFail: {
                    count: 500, // Keep last 500 failed jobs
                },
            },
        });

        this.events = new QueueEvents(QUEUE_NAMES.SCRAPING, { connection });
    }

    /**
     * Add a full sync job for an integration
     */
    async addFullSyncJob(integrationId: string, priority = 0): Promise<string> {
        const job = await this.queue.add(
            'full-sync',
            {
                integrationId,
                type: 'full_sync',
                priority,
            },
            {
                priority,
                jobId: `full-sync-${integrationId}-${Date.now()}`,
            }
        );
        return job.id!;
    }

    /**
     * Add an incremental sync job (only new/updated listings)
     */
    async addIncrementalSyncJob(integrationId: string): Promise<string> {
        const job = await this.queue.add(
            'incremental-sync',
            {
                integrationId,
                type: 'incremental',
            },
            {
                priority: 5, // Higher priority than full sync
                jobId: `incremental-${integrationId}-${Date.now()}`,
            }
        );
        return job.id!;
    }

    /**
     * Add a job to scrape a single URL
     */
    async addSingleUrlJob(integrationId: string, url: string): Promise<string> {
        const job = await this.queue.add(
            'single-url',
            {
                integrationId,
                type: 'single_url',
                url,
            },
            {
                priority: 10, // Highest priority
                jobId: `single-${integrationId}-${Date.now()}`,
            }
        );
        return job.id!;
    }

    /**
     * Schedule recurring sync jobs based on cron expression
     */
    async scheduleRecurringSync(
        integrationId: string,
        cron: string,
        timezone = 'Europe/Bucharest'
    ): Promise<void> {
        await this.queue.add(
            'scheduled-sync',
            {
                integrationId,
                type: 'incremental',
            },
            {
                repeat: {
                    pattern: cron,
                    tz: timezone,
                },
                jobId: `scheduled-${integrationId}`,
            }
        );
    }

    /**
     * Remove scheduled sync for an integration
     */
    async removeScheduledSync(integrationId: string): Promise<void> {
        const repeatableJobs = await this.queue.getRepeatableJobs();
        const job = repeatableJobs.find(j => j.id === `scheduled-${integrationId}`);
        if (job) {
            await this.queue.removeRepeatableByKey(job.key);
        }
    }

    /**
     * Get queue status
     */
    async getQueueStatus() {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            this.queue.getWaitingCount(),
            this.queue.getActiveCount(),
            this.queue.getCompletedCount(),
            this.queue.getFailedCount(),
            this.queue.getDelayedCount(),
        ]);

        return { waiting, active, completed, failed, delayed };
    }

    /**
     * Get jobs for an integration
     */
    async getJobsForIntegration(integrationId: string, limit = 10) {
        const jobs = await this.queue.getJobs(['completed', 'failed', 'waiting', 'active'], 0, 100);
        return jobs
            .filter(job => job.data.integrationId === integrationId)
            .slice(0, limit)
            .map(job => ({
                id: job.id,
                name: job.name,
                status: job.finishedOn ? (job.failedReason ? 'failed' : 'completed') : 'pending',
                progress: job.progress,
                attemptsMade: job.attemptsMade,
                data: job.data,
                result: job.returnvalue,
                error: job.failedReason,
                createdAt: new Date(job.timestamp),
                finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
            }));
    }

    /**
     * Pause the queue
     */
    async pause(): Promise<void> {
        await this.queue.pause();
    }

    /**
     * Resume the queue
     */
    async resume(): Promise<void> {
        await this.queue.resume();
    }

    /**
     * Clean up old jobs
     */
    async clean(gracePeriod = 24 * 60 * 60 * 1000): Promise<void> {
        await this.queue.clean(gracePeriod, 1000, 'completed');
        await this.queue.clean(gracePeriod * 7, 500, 'failed');
    }
}

export const scrapingQueue = new ScrapingQueueService();

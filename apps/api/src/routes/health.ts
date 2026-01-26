import { Router, type Request, type Response } from 'express';
import { getPrismaClient } from '@unimobiliare/database';

const router = Router();

/**
 * Health check endpoint
 * GET /api/v1/health
 */
router.get('/', async (_req: Request, res: Response) => {
    const prisma = getPrismaClient();

    let dbStatus = 'ok';
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch {
        dbStatus = 'error';
    }

    res.json({
        success: true,
        data: {
            status: dbStatus === 'ok' ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            services: {
                api: 'ok',
                database: dbStatus,
            },
        },
    });
});

/**
 * Readiness probe (for Kubernetes/Docker)
 * GET /api/v1/health/ready
 */
router.get('/ready', async (_req: Request, res: Response) => {
    const prisma = getPrismaClient();

    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ success: true, data: { ready: true } });
    } catch {
        res.status(503).json({ success: false, error: { code: 'NOT_READY', message: 'Database not ready' } });
    }
});

/**
 * Liveness probe
 * GET /api/v1/health/live
 */
router.get('/live', (_req: Request, res: Response) => {
    res.json({ success: true, data: { live: true } });
});

export { router as healthRoutes };

/**
 * Admin Routes
 * 
 * STRICT: Admin-only endpoints for dashboard stats and management
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getPrismaClient } from '@unimobiliare/database';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * GET /api/v1/admin/stats
 * Dashboard statistics
 */
router.get('/stats', async (_req, res, next) => {
    try {
        const prisma = getPrismaClient();

        const [
            totalUsers,
            activeUsers,
            trialUsers,
            totalListings,
            activeListings,
            totalIntegrations,
            activeIntegrations,
            recentActivity,
        ] = await Promise.all([
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.user.count({ where: { deletedAt: null, subscriptionStatus: 'active' } }),
            prisma.user.count({ where: { deletedAt: null, subscriptionStatus: 'trial' } }),
            prisma.listing.count(),
            prisma.listing.count({ where: { status: 'active' } }),
            prisma.integration.count(),
            prisma.integration.count({ where: { status: 'active' } }),
            prisma.auditLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { admin: { select: { name: true, email: true } } },
            }),
        ]);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    trial: trialUsers,
                },
                listings: {
                    total: totalListings,
                    active: activeListings,
                },
                integrations: {
                    total: totalIntegrations,
                    active: activeIntegrations,
                },
                recentActivity: recentActivity.map((log) => ({
                    id: log.id,
                    action: log.action,
                    entity: log.entity,
                    metadata: log.metadata,
                    timestamp: log.createdAt,
                    admin: log.admin?.name || log.admin?.email || 'System',
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/admin/audit-logs
 * Audit logs with pagination
 */
router.get('/audit-logs', async (req, res, next) => {
    try {
        const prisma = getPrismaClient();
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { admin: { select: { name: true, email: true } } },
            }),
            prisma.auditLog.count(),
        ]);

        res.json({
            success: true,
            data: logs.map((log) => ({
                id: log.id,
                action: log.action,
                entity: log.entity,
                entityId: log.entityId,
                metadata: log.metadata,
                timestamp: log.createdAt,
                admin: log.admin?.name || log.admin?.email || 'System',
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
});

export { router as adminRoutes };

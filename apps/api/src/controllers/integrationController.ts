/**
 * Integration Controller
 *
 * HTTP layer for integration endpoints.
 * Handles request/response formatting, delegates to service.
 */

import { Request, Response } from 'express';
import { IIntegrationService } from '../services/integrationService';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IIntegrationController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    toggleEnabled(req: Request, res: Response): Promise<void>;
    triggerSync(req: Request, res: Response): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class IntegrationController implements IIntegrationController {
    constructor(private integrationService: IIntegrationService) { }

    async getAll(req: Request, res: Response): Promise<void> {
        const {
            page,
            perPage,
            enabled,
            search,
            orderBy,
            orderDir,
        } = req.query;

        const result = await this.integrationService.getAll({
            page: page ? parseInt(page as string, 10) : undefined,
            perPage: perPage ? parseInt(perPage as string, 10) : undefined,
            enabled: enabled ? enabled === 'true' : undefined,
            search: search as string | undefined,
            orderBy: orderBy as 'name' | 'createdAt' | 'lastSyncAt' | undefined,
            orderDir: orderDir as 'asc' | 'desc' | undefined,
        });

        res.json({
            success: true,
            data: result.items,
            meta: {
                total: result.total,
                page: result.page,
                perPage: result.perPage,
                totalPages: Math.ceil(result.total / result.perPage),
            },
        });
    }

    async getById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        const integration = await this.integrationService.getById(id);

        res.json({
            success: true,
            data: integration,
        });
    }

    async create(req: Request, res: Response): Promise<void> {
        const {
            name,
            displayName,
            enabled,
            sourceConfig,
            listPageConfig,
            fieldMappings,
            schedule,
        } = req.body;

        const integration = await this.integrationService.create({
            name,
            displayName,
            enabled,
            sourceConfig,
            listPageConfig,
            fieldMappings,
            schedule,
        });

        res.status(201).json({
            success: true,
            data: integration,
        });
    }

    async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const {
            displayName,
            enabled,
            sourceConfig,
            listPageConfig,
            fieldMappings,
            schedule,
        } = req.body;

        const integration = await this.integrationService.update(id, {
            displayName,
            enabled,
            sourceConfig,
            listPageConfig,
            fieldMappings,
            schedule,
        });

        res.json({
            success: true,
            data: integration,
        });
    }

    async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        await this.integrationService.delete(id);

        res.status(204).send();
    }

    async toggleEnabled(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { enabled } = req.body;

        const integration = await this.integrationService.toggleEnabled(id, enabled);

        res.json({
            success: true,
            data: integration,
        });
    }

    async triggerSync(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        const integration = await this.integrationService.triggerSync(id);

        res.json({
            success: true,
            data: integration,
            message: 'Sync triggered successfully',
        });
    }
}

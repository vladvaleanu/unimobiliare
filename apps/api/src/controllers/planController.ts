/**
 * Subscription Plan Controller
 *
 * HTTP layer for subscription plan endpoints.
 */

import { Request, Response } from 'express';
import { IPlanService } from '../services/planService';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IPlanController {
    getAll(req: Request, res: Response): Promise<void>;
    getActive(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    getBySlug(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    toggleActive(req: Request, res: Response): Promise<void>;
    toggleFeatured(req: Request, res: Response): Promise<void>;
    reorder(req: Request, res: Response): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class PlanController implements IPlanController {
    constructor(private planService: IPlanService) { }

    async getAll(req: Request, res: Response): Promise<void> {
        const { page, perPage, isActive, orderBy, orderDir } = req.query;

        const result = await this.planService.getAll({
            page: page ? parseInt(page as string, 10) : undefined,
            perPage: perPage ? parseInt(perPage as string, 10) : undefined,
            isActive: isActive ? isActive === 'true' : undefined,
            orderBy: orderBy as 'name' | 'displayOrder' | 'priceMonthly' | undefined,
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

    async getActive(_req: Request, res: Response): Promise<void> {
        const plans = await this.planService.getActive();

        res.json({
            success: true,
            data: plans,
        });
    }

    async getById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        const plan = await this.planService.getById(id);

        res.json({
            success: true,
            data: plan,
        });
    }

    async getBySlug(req: Request, res: Response): Promise<void> {
        const { slug } = req.params;

        const plan = await this.planService.getBySlug(slug);

        res.json({
            success: true,
            data: plan,
        });
    }

    async create(req: Request, res: Response): Promise<void> {
        const {
            name,
            slug,
            description,
            priceMonthly,
            priceYearly,
            trialDays,
            limits,
            features,
            alertTypes,
            isActive,
            isFeatured,
            displayOrder,
            stripePriceIds,
        } = req.body;

        const plan = await this.planService.create({
            name,
            slug,
            description,
            priceMonthly,
            priceYearly,
            trialDays,
            limits,
            features,
            alertTypes,
            isActive,
            isFeatured,
            displayOrder,
            stripePriceIds,
        });

        res.status(201).json({
            success: true,
            data: plan,
        });
    }

    async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const {
            name,
            description,
            priceMonthly,
            priceYearly,
            trialDays,
            limits,
            features,
            alertTypes,
            isActive,
            isFeatured,
            displayOrder,
            stripePriceIds,
        } = req.body;

        const plan = await this.planService.update(id, {
            name,
            description,
            priceMonthly,
            priceYearly,
            trialDays,
            limits,
            features,
            alertTypes,
            isActive,
            isFeatured,
            displayOrder,
            stripePriceIds,
        });

        res.json({
            success: true,
            data: plan,
        });
    }

    async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        await this.planService.delete(id);

        res.status(204).send();
    }

    async toggleActive(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { isActive } = req.body;

        const plan = await this.planService.toggleActive(id, isActive);

        res.json({
            success: true,
            data: plan,
        });
    }

    async toggleFeatured(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { isFeatured } = req.body;

        const plan = await this.planService.toggleFeatured(id, isFeatured);

        res.json({
            success: true,
            data: plan,
        });
    }

    async reorder(req: Request, res: Response): Promise<void> {
        const { plans } = req.body;

        await this.planService.reorder(plans);

        res.json({
            success: true,
            message: 'Plans reordered successfully',
        });
    }
}

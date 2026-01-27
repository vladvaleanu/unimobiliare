/**
 * Subscription Plan Service
 *
 * Business logic for subscription plan management.
 */

import { SubscriptionPlan } from '@prisma/client';
import {
    IPlanRepository,
    PlanCreateInput,
    PlanUpdateInput,
    PlanFindManyOptions,
} from '../repositories/planRepository';
import { NotFoundError, ConflictError, ValidationError } from '../errors';
import { slugify } from '@unimobiliare/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IPlanService {
    getById(id: string): Promise<SubscriptionPlan>;
    getBySlug(slug: string): Promise<SubscriptionPlan>;
    getAll(options?: PlanFindManyOptions): Promise<{ items: SubscriptionPlan[]; total: number; page: number; perPage: number }>;
    getActive(): Promise<SubscriptionPlan[]>;
    create(input: PlanCreateInput): Promise<SubscriptionPlan>;
    update(id: string, input: PlanUpdateInput): Promise<SubscriptionPlan>;
    delete(id: string): Promise<void>;
    toggleActive(id: string, isActive: boolean): Promise<SubscriptionPlan>;
    toggleFeatured(id: string, isFeatured: boolean): Promise<SubscriptionPlan>;
    reorder(plans: { id: string; displayOrder: number }[]): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class PlanService implements IPlanService {
    constructor(private planRepository: IPlanRepository) { }

    async getById(id: string): Promise<SubscriptionPlan> {
        const plan = await this.planRepository.findById(id);

        if (!plan) {
            throw new NotFoundError('Subscription plan not found', 'PLAN_NOT_FOUND');
        }

        return plan;
    }

    async getBySlug(slug: string): Promise<SubscriptionPlan> {
        const plan = await this.planRepository.findBySlug(slug);

        if (!plan) {
            throw new NotFoundError('Subscription plan not found', 'PLAN_NOT_FOUND');
        }

        return plan;
    }

    async getAll(options: PlanFindManyOptions = {}): Promise<{
        items: SubscriptionPlan[];
        total: number;
        page: number;
        perPage: number;
    }> {
        const page = options.page ?? DEFAULT_PAGE;
        const perPage = options.perPage ?? DEFAULT_PER_PAGE;

        const result = await this.planRepository.findMany({
            ...options,
            page,
            perPage,
        });

        return {
            ...result,
            page,
            perPage,
        };
    }

    async getActive(): Promise<SubscriptionPlan[]> {
        return this.planRepository.findActive();
    }

    async create(input: PlanCreateInput): Promise<SubscriptionPlan> {
        // Generate slug if not provided
        const slug = input.slug || slugify(input.name);

        // Check if slug already exists
        const existing = await this.planRepository.findBySlug(slug);
        if (existing) {
            throw new ConflictError(
                `Plan with slug "${slug}" already exists`,
                'PLAN_SLUG_EXISTS'
            );
        }

        // Validate prices
        if (input.priceMonthly < 0) {
            throw new ValidationError('Monthly price cannot be negative', 'INVALID_PRICE');
        }
        if (input.priceYearly < 0) {
            throw new ValidationError('Yearly price cannot be negative', 'INVALID_PRICE');
        }

        // Validate limits structure
        this.validateLimits(input.limits);

        // Validate features structure
        this.validateFeatures(input.features);

        return this.planRepository.create({
            ...input,
            slug,
        });
    }

    async update(id: string, input: PlanUpdateInput): Promise<SubscriptionPlan> {
        const existing = await this.planRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Subscription plan not found', 'PLAN_NOT_FOUND');
        }

        // Validate prices if provided
        if (input.priceMonthly !== undefined && input.priceMonthly < 0) {
            throw new ValidationError('Monthly price cannot be negative', 'INVALID_PRICE');
        }
        if (input.priceYearly !== undefined && input.priceYearly < 0) {
            throw new ValidationError('Yearly price cannot be negative', 'INVALID_PRICE');
        }

        // Validate limits if provided
        if (input.limits) {
            this.validateLimits(input.limits);
        }

        // Validate features if provided
        if (input.features) {
            this.validateFeatures(input.features);
        }

        return this.planRepository.update(id, input);
    }

    async delete(id: string): Promise<void> {
        const existing = await this.planRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Subscription plan not found', 'PLAN_NOT_FOUND');
        }

        // TODO: Check if any users are subscribed to this plan
        // If so, prevent deletion or handle migration

        await this.planRepository.delete(id);
    }

    async toggleActive(id: string, isActive: boolean): Promise<SubscriptionPlan> {
        const existing = await this.planRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Subscription plan not found', 'PLAN_NOT_FOUND');
        }

        return this.planRepository.update(id, { isActive });
    }

    async toggleFeatured(id: string, isFeatured: boolean): Promise<SubscriptionPlan> {
        const existing = await this.planRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Subscription plan not found', 'PLAN_NOT_FOUND');
        }

        return this.planRepository.update(id, { isFeatured });
    }

    async reorder(plans: { id: string; displayOrder: number }[]): Promise<void> {
        // Validate all plans exist
        for (const plan of plans) {
            const existing = await this.planRepository.findById(plan.id);
            if (!existing) {
                throw new NotFoundError(`Plan ${plan.id} not found`, 'PLAN_NOT_FOUND');
            }
        }

        await this.planRepository.reorder(plans);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Private Validation Methods
    // ─────────────────────────────────────────────────────────────────────────────

    private validateLimits(limits: unknown): void {
        if (!limits || typeof limits !== 'object') {
            throw new ValidationError('Invalid limits structure', 'INVALID_LIMITS');
        }

        const lim = limits as Record<string, unknown>;
        const requiredFields = ['maxSearchProfiles', 'maxSavedListings', 'maxAlerts'];

        for (const field of requiredFields) {
            if (typeof lim[field] !== 'number' || lim[field] < 0) {
                throw new ValidationError(
                    `Limits must have a valid ${field} (non-negative number)`,
                    'INVALID_LIMITS'
                );
            }
        }
    }

    private validateFeatures(features: unknown): void {
        if (!features || typeof features !== 'object') {
            throw new ValidationError('Invalid features structure', 'INVALID_FEATURES');
        }

        const feat = features as Record<string, unknown>;
        const booleanFields = [
            'aiFeatures',
            'priceHistory',
            'exportData',
            'prioritySupport',
            'apiAccess',
        ];

        for (const field of booleanFields) {
            if (feat[field] !== undefined && typeof feat[field] !== 'boolean') {
                throw new ValidationError(
                    `Feature ${field} must be a boolean`,
                    'INVALID_FEATURES'
                );
            }
        }
    }
}

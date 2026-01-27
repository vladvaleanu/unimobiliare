/**
 * Subscription Plan Repository
 *
 * Data access layer for subscription plan entities.
 */

import { PrismaClient, SubscriptionPlan, Prisma } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IPlanRepository {
    findById(id: string): Promise<SubscriptionPlan | null>;
    findBySlug(slug: string): Promise<SubscriptionPlan | null>;
    findMany(options?: PlanFindManyOptions): Promise<{ items: SubscriptionPlan[]; total: number }>;
    findActive(): Promise<SubscriptionPlan[]>;
    create(data: PlanCreateInput): Promise<SubscriptionPlan>;
    update(id: string, data: PlanUpdateInput): Promise<SubscriptionPlan>;
    delete(id: string): Promise<void>;
    reorder(plans: { id: string; displayOrder: number }[]): Promise<void>;
}

export interface PlanFindManyOptions {
    page?: number;
    perPage?: number;
    isActive?: boolean;
    orderBy?: 'name' | 'displayOrder' | 'priceMonthly';
    orderDir?: 'asc' | 'desc';
}

export interface PlanCreateInput {
    name: string;
    slug: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    trialDays?: number;
    limits: Prisma.JsonValue;
    features: Prisma.JsonValue;
    alertTypes: string[];
    isActive?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
    stripePriceIds?: Prisma.JsonValue;
}

export interface PlanUpdateInput {
    name?: string;
    description?: string;
    priceMonthly?: number;
    priceYearly?: number;
    trialDays?: number;
    limits?: Prisma.JsonValue;
    features?: Prisma.JsonValue;
    alertTypes?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
    stripePriceIds?: Prisma.JsonValue;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class PlanRepository implements IPlanRepository {
    constructor(private prisma: PrismaClient) { }

    async findById(id: string): Promise<SubscriptionPlan | null> {
        return this.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
    }

    async findBySlug(slug: string): Promise<SubscriptionPlan | null> {
        return this.prisma.subscriptionPlan.findUnique({
            where: { slug },
        });
    }

    async findMany(options: PlanFindManyOptions = {}): Promise<{ items: SubscriptionPlan[]; total: number }> {
        const {
            page = DEFAULT_PAGE,
            perPage = DEFAULT_PER_PAGE,
            isActive,
            orderBy = 'displayOrder',
            orderDir = 'asc',
        } = options;

        const take = Math.min(perPage, MAX_PER_PAGE);
        const skip = (page - 1) * take;

        const where: Prisma.SubscriptionPlanWhereInput = {};

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [items, total] = await Promise.all([
            this.prisma.subscriptionPlan.findMany({
                where,
                orderBy: { [orderBy]: orderDir },
                skip,
                take,
            }),
            this.prisma.subscriptionPlan.count({ where }),
        ]);

        return { items, total };
    }

    async findActive(): Promise<SubscriptionPlan[]> {
        return this.prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
        });
    }

    async create(data: PlanCreateInput): Promise<SubscriptionPlan> {
        return this.prisma.subscriptionPlan.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                priceMonthly: data.priceMonthly,
                priceYearly: data.priceYearly,
                trialDays: data.trialDays ?? 0,
                limits: data.limits,
                features: data.features,
                alertTypes: data.alertTypes as any,
                isActive: data.isActive ?? true,
                isFeatured: data.isFeatured ?? false,
                displayOrder: data.displayOrder ?? 0,
                stripePriceIds: data.stripePriceIds,
            },
        });
    }

    async update(id: string, data: PlanUpdateInput): Promise<SubscriptionPlan> {
        return this.prisma.subscriptionPlan.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                priceMonthly: data.priceMonthly,
                priceYearly: data.priceYearly,
                trialDays: data.trialDays,
                limits: data.limits,
                features: data.features,
                alertTypes: data.alertTypes as any,
                isActive: data.isActive,
                isFeatured: data.isFeatured,
                displayOrder: data.displayOrder,
                stripePriceIds: data.stripePriceIds,
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.subscriptionPlan.delete({
            where: { id },
        });
    }

    async reorder(plans: { id: string; displayOrder: number }[]): Promise<void> {
        await this.prisma.$transaction(
            plans.map((plan) =>
                this.prisma.subscriptionPlan.update({
                    where: { id: plan.id },
                    data: { displayOrder: plan.displayOrder },
                })
            )
        );
    }
}

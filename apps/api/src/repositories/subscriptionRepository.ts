/**
 * Subscription Repository
 *
 * Data access layer for user subscriptions.
 */

import { PrismaClient, Subscription, SubscriptionStatus, Prisma } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface ISubscriptionRepository {
    findById(id: string): Promise<Subscription | null>;
    findByUserId(userId: string): Promise<Subscription | null>;
    findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>;
    findActive(): Promise<Subscription[]>;
    findExpiringSoon(days: number): Promise<Subscription[]>;
    create(data: SubscriptionCreateInput): Promise<Subscription>;
    update(id: string, data: SubscriptionUpdateInput): Promise<Subscription>;
    updateByStripeId(stripeSubscriptionId: string, data: SubscriptionUpdateInput): Promise<Subscription>;
    delete(id: string): Promise<void>;
}

export interface SubscriptionCreateInput {
    userId: string;
    planId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd?: boolean;
    trialEnd?: Date | null;
}

export interface SubscriptionUpdateInput {
    planId?: string;
    stripePriceId?: string;
    status?: SubscriptionStatus;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date | null;
    trialEnd?: Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class SubscriptionRepository implements ISubscriptionRepository {
    constructor(private prisma: PrismaClient) { }

    async findById(id: string): Promise<Subscription | null> {
        return this.prisma.subscription.findUnique({
            where: { id },
            include: {
                plan: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    async findByUserId(userId: string): Promise<Subscription | null> {
        return this.prisma.subscription.findUnique({
            where: { userId },
            include: {
                plan: true,
            },
        });
    }

    async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
        return this.prisma.subscription.findUnique({
            where: { stripeSubscriptionId },
            include: {
                plan: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findActive(): Promise<Subscription[]> {
        return this.prisma.subscription.findMany({
            where: {
                status: {
                    in: ['active', 'trialing'],
                },
            },
            include: {
                plan: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findExpiringSoon(days: number): Promise<Subscription[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return this.prisma.subscription.findMany({
            where: {
                status: 'active',
                cancelAtPeriodEnd: true,
                currentPeriodEnd: {
                    lte: futureDate,
                },
            },
            include: {
                plan: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
    }

    async create(data: SubscriptionCreateInput): Promise<Subscription> {
        return this.prisma.subscription.create({
            data: {
                userId: data.userId,
                planId: data.planId,
                stripeCustomerId: data.stripeCustomerId,
                stripeSubscriptionId: data.stripeSubscriptionId,
                stripePriceId: data.stripePriceId,
                status: data.status,
                currentPeriodStart: data.currentPeriodStart,
                currentPeriodEnd: data.currentPeriodEnd,
                cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
                trialEnd: data.trialEnd,
            },
            include: {
                plan: true,
            },
        });
    }

    async update(id: string, data: SubscriptionUpdateInput): Promise<Subscription> {
        return this.prisma.subscription.update({
            where: { id },
            data: {
                planId: data.planId,
                stripePriceId: data.stripePriceId,
                status: data.status,
                currentPeriodStart: data.currentPeriodStart,
                currentPeriodEnd: data.currentPeriodEnd,
                cancelAtPeriodEnd: data.cancelAtPeriodEnd,
                canceledAt: data.canceledAt,
                trialEnd: data.trialEnd,
            },
            include: {
                plan: true,
            },
        });
    }

    async updateByStripeId(stripeSubscriptionId: string, data: SubscriptionUpdateInput): Promise<Subscription> {
        return this.prisma.subscription.update({
            where: { stripeSubscriptionId },
            data: {
                planId: data.planId,
                stripePriceId: data.stripePriceId,
                status: data.status,
                currentPeriodStart: data.currentPeriodStart,
                currentPeriodEnd: data.currentPeriodEnd,
                cancelAtPeriodEnd: data.cancelAtPeriodEnd,
                canceledAt: data.canceledAt,
                trialEnd: data.trialEnd,
            },
            include: {
                plan: true,
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.subscription.delete({
            where: { id },
        });
    }
}

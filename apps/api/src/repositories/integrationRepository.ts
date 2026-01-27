/**
 * Integration Repository
 *
 * Data access layer for integration entities.
 * Implements Repository pattern for clean separation of concerns.
 */

import { PrismaClient, Integration, SyncStatus, Prisma } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IIntegrationRepository {
    findById(id: string): Promise<Integration | null>;
    findByName(name: string): Promise<Integration | null>;
    findMany(options?: IntegrationFindManyOptions): Promise<{ items: Integration[]; total: number }>;
    create(data: IntegrationCreateInput): Promise<Integration>;
    update(id: string, data: IntegrationUpdateInput): Promise<Integration>;
    delete(id: string): Promise<void>;
    updateSyncStatus(id: string, status: SyncStatus, error?: string): Promise<Integration>;
}

export interface IntegrationFindManyOptions {
    page?: number;
    perPage?: number;
    enabled?: boolean;
    search?: string;
    orderBy?: 'name' | 'createdAt' | 'lastSyncAt';
    orderDir?: 'asc' | 'desc';
}

export interface IntegrationCreateInput {
    name: string;
    displayName: string;
    enabled?: boolean;
    sourceConfig: Prisma.JsonValue;
    listPageConfig: Prisma.JsonValue;
    fieldMappings: Prisma.JsonValue;
    schedule?: string;
}

export interface IntegrationUpdateInput {
    displayName?: string;
    enabled?: boolean;
    sourceConfig?: Prisma.JsonValue;
    listPageConfig?: Prisma.JsonValue;
    fieldMappings?: Prisma.JsonValue;
    schedule?: string;
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

export class IntegrationRepository implements IIntegrationRepository {
    constructor(private prisma: PrismaClient) { }

    async findById(id: string): Promise<Integration | null> {
        return this.prisma.integration.findUnique({
            where: { id },
        });
    }

    async findByName(name: string): Promise<Integration | null> {
        return this.prisma.integration.findUnique({
            where: { name },
        });
    }

    async findMany(options: IntegrationFindManyOptions = {}): Promise<{ items: Integration[]; total: number }> {
        const {
            page = DEFAULT_PAGE,
            perPage = DEFAULT_PER_PAGE,
            enabled,
            search,
            orderBy = 'createdAt',
            orderDir = 'desc',
        } = options;

        const take = Math.min(perPage, MAX_PER_PAGE);
        const skip = (page - 1) * take;

        const where: Prisma.IntegrationWhereInput = {};

        if (enabled !== undefined) {
            where.enabled = enabled;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { displayName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.integration.findMany({
                where,
                orderBy: { [orderBy]: orderDir },
                skip,
                take,
            }),
            this.prisma.integration.count({ where }),
        ]);

        return { items, total };
    }

    async create(data: IntegrationCreateInput): Promise<Integration> {
        return this.prisma.integration.create({
            data: {
                name: data.name,
                displayName: data.displayName,
                enabled: data.enabled ?? false,
                sourceConfig: data.sourceConfig,
                listPageConfig: data.listPageConfig,
                fieldMappings: data.fieldMappings,
                schedule: data.schedule,
            },
        });
    }

    async update(id: string, data: IntegrationUpdateInput): Promise<Integration> {
        return this.prisma.integration.update({
            where: { id },
            data: {
                displayName: data.displayName,
                enabled: data.enabled,
                sourceConfig: data.sourceConfig,
                listPageConfig: data.listPageConfig,
                fieldMappings: data.fieldMappings,
                schedule: data.schedule,
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.integration.delete({
            where: { id },
        });
    }

    async updateSyncStatus(
        id: string,
        status: SyncStatus,
        error?: string
    ): Promise<Integration> {
        return this.prisma.integration.update({
            where: { id },
            data: {
                lastSyncStatus: status,
                lastSyncAt: status === 'running' ? undefined : new Date(),
                lastSyncError: error ?? null,
            },
        });
    }
}

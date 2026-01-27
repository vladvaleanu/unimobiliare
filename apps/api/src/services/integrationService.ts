/**
 * Integration Service
 *
 * Business logic layer for integration management.
 * Handles validation, business rules, and orchestration.
 */

import { Integration, SyncStatus } from '@prisma/client';
import {
    IIntegrationRepository,
    IntegrationCreateInput,
    IntegrationUpdateInput,
    IntegrationFindManyOptions,
} from '../repositories/integrationRepository';
import { NotFoundError, ConflictError, ValidationError } from '../errors';

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IIntegrationService {
    getById(id: string): Promise<Integration>;
    getAll(options?: IntegrationFindManyOptions): Promise<{ items: Integration[]; total: number; page: number; perPage: number }>;
    create(input: IntegrationCreateInput): Promise<Integration>;
    update(id: string, input: IntegrationUpdateInput): Promise<Integration>;
    delete(id: string): Promise<void>;
    toggleEnabled(id: string, enabled: boolean): Promise<Integration>;
    triggerSync(id: string): Promise<Integration>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class IntegrationService implements IIntegrationService {
    constructor(private integrationRepository: IIntegrationRepository) { }

    async getById(id: string): Promise<Integration> {
        const integration = await this.integrationRepository.findById(id);

        if (!integration) {
            throw new NotFoundError('Integration not found', 'INTEGRATION_NOT_FOUND');
        }

        return integration;
    }

    async getAll(options: IntegrationFindManyOptions = {}): Promise<{
        items: Integration[];
        total: number;
        page: number;
        perPage: number;
    }> {
        const page = options.page ?? DEFAULT_PAGE;
        const perPage = options.perPage ?? DEFAULT_PER_PAGE;

        const result = await this.integrationRepository.findMany({
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

    async create(input: IntegrationCreateInput): Promise<Integration> {
        // Validate name format (lowercase, alphanumeric with hyphens)
        if (!/^[a-z0-9-]+$/.test(input.name)) {
            throw new ValidationError(
                'Integration name must be lowercase alphanumeric with hyphens only',
                'INVALID_INTEGRATION_NAME'
            );
        }

        // Check if name already exists
        const existing = await this.integrationRepository.findByName(input.name);
        if (existing) {
            throw new ConflictError(
                `Integration with name "${input.name}" already exists`,
                'INTEGRATION_NAME_EXISTS'
            );
        }

        // Validate required configs
        this.validateSourceConfig(input.sourceConfig);
        this.validateListPageConfig(input.listPageConfig);
        this.validateFieldMappings(input.fieldMappings);

        return this.integrationRepository.create(input);
    }

    async update(id: string, input: IntegrationUpdateInput): Promise<Integration> {
        // Ensure integration exists
        const existing = await this.integrationRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Integration not found', 'INTEGRATION_NOT_FOUND');
        }

        // Validate configs if provided
        if (input.sourceConfig) {
            this.validateSourceConfig(input.sourceConfig);
        }
        if (input.listPageConfig) {
            this.validateListPageConfig(input.listPageConfig);
        }
        if (input.fieldMappings) {
            this.validateFieldMappings(input.fieldMappings);
        }

        return this.integrationRepository.update(id, input);
    }

    async delete(id: string): Promise<void> {
        const existing = await this.integrationRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Integration not found', 'INTEGRATION_NOT_FOUND');
        }

        // Check if sync is running
        if (existing.lastSyncStatus === 'running') {
            throw new ConflictError(
                'Cannot delete integration while sync is running',
                'SYNC_IN_PROGRESS'
            );
        }

        await this.integrationRepository.delete(id);
    }

    async toggleEnabled(id: string, enabled: boolean): Promise<Integration> {
        const existing = await this.integrationRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Integration not found', 'INTEGRATION_NOT_FOUND');
        }

        return this.integrationRepository.update(id, { enabled });
    }

    async triggerSync(id: string): Promise<Integration> {
        const existing = await this.integrationRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Integration not found', 'INTEGRATION_NOT_FOUND');
        }

        if (!existing.enabled) {
            throw new ValidationError(
                'Cannot sync disabled integration',
                'INTEGRATION_DISABLED'
            );
        }

        if (existing.lastSyncStatus === 'running') {
            throw new ConflictError('Sync is already in progress', 'SYNC_IN_PROGRESS');
        }

        // Update status to running
        const updated = await this.integrationRepository.updateSyncStatus(id, 'running');

        // TODO: Queue sync job to BullMQ worker
        // await this.syncQueue.add('sync-integration', { integrationId: id });

        return updated;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Private Validation Methods
    // ─────────────────────────────────────────────────────────────────────────────

    private validateSourceConfig(config: unknown): void {
        if (!config || typeof config !== 'object') {
            throw new ValidationError('Invalid source config', 'INVALID_SOURCE_CONFIG');
        }

        const cfg = config as Record<string, unknown>;

        if (!cfg.baseUrl || typeof cfg.baseUrl !== 'string') {
            throw new ValidationError('Source config must have a valid baseUrl', 'INVALID_BASE_URL');
        }

        if (!cfg.type || !['html', 'api'].includes(cfg.type as string)) {
            throw new ValidationError('Source config type must be "html" or "api"', 'INVALID_SOURCE_TYPE');
        }
    }

    private validateListPageConfig(config: unknown): void {
        if (!config || typeof config !== 'object') {
            throw new ValidationError('Invalid list page config', 'INVALID_LIST_PAGE_CONFIG');
        }

        const cfg = config as Record<string, unknown>;

        if (!cfg.listSelector || typeof cfg.listSelector !== 'string') {
            throw new ValidationError('List page config must have a listSelector', 'INVALID_LIST_SELECTOR');
        }

        if (!cfg.itemSelector || typeof cfg.itemSelector !== 'string') {
            throw new ValidationError('List page config must have an itemSelector', 'INVALID_ITEM_SELECTOR');
        }
    }

    private validateFieldMappings(mappings: unknown): void {
        if (!Array.isArray(mappings)) {
            throw new ValidationError('Field mappings must be an array', 'INVALID_FIELD_MAPPINGS');
        }

        // Check required fields are mapped
        const requiredFields = ['title', 'price', 'location.city', 'externalId'];
        const mappedFields = mappings.map((m: { field?: string }) => m.field);

        const missingFields = requiredFields.filter(f => !mappedFields.includes(f));

        if (missingFields.length > 0) {
            throw new ValidationError(
                `Missing required field mappings: ${missingFields.join(', ')}`,
                'MISSING_REQUIRED_FIELDS'
            );
        }
    }
}

import { PAGINATION } from '../constants/pagination.js';
import type { PaginationMeta, PaginationParams } from '../types/api.js';

/**
 * Calculate pagination offset from page number
 */
export function calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
}

/**
 * Calculate total pages from total count and limit
 */
export function calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
}

/**
 * Normalize pagination params with defaults
 */
export function normalizePaginationParams(params: PaginationParams): Required<Pick<PaginationParams, 'page' | 'limit'>> {
    return {
        page: Math.max(1, params.page ?? PAGINATION.DEFAULT_PAGE),
        limit: Math.min(
            PAGINATION.MAX_LIMIT,
            Math.max(1, params.limit ?? PAGINATION.DEFAULT_LIMIT)
        ),
    };
}

/**
 * Build pagination meta for API response
 */
export function buildPaginationMeta(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    return {
        page,
        limit,
        total,
        totalPages: calculateTotalPages(total, limit),
    };
}

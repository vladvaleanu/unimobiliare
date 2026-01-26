/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    meta?: PaginationMeta;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        errors?: FieldError[];
    };
}

/**
 * Field-level validation error
 */
export interface FieldError {
    field: string;
    message: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * Paginated list query params
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * API response type (success or error)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

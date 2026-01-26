import type { AuditAction } from '../constants/status.js';

/**
 * Audit log entry
 */
export interface AuditLog {
    id: string;
    timestamp: Date;
    adminId: string;
    adminEmail: string;
    action: AuditAction;
    resourceType: string;
    resourceId: string | null;
    changes: {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
    } | null;
    ipAddress: string;
    userAgent: string;
}

/**
 * Audit log filters for querying
 */
export interface AuditLogFilters {
    adminId?: string;
    action?: AuditAction;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
}

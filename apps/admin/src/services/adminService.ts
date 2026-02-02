/**
 * Admin Service
 * 
 * API calls for admin dashboard and stats
 */

import { apiClient } from './api';

export interface DashboardStats {
    users: {
        total: number;
        active: number;
        trial: number;
    };
    listings: {
        total: number;
        active: number;
    };
    integrations: {
        total: number;
        active: number;
    };
    recentActivity: {
        id: string;
        action: string;
        entity: string;
        metadata: any;
        timestamp: string;
        admin: string;
    }[];
}

export interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata: any;
    timestamp: string;
    admin: string;
}

export const adminService = {
    async getStats() {
        return apiClient.get<{ success: boolean; data: DashboardStats }>('/admin/stats');
    },

    async getAuditLogs(page = 1, limit = 20) {
        return apiClient.get<{
            success: boolean;
            data: AuditLog[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        }>(`/admin/audit-logs?page=${page}&limit=${limit}`);
    },
};

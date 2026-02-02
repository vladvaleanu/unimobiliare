/**
 * Users Service
 * 
 * API calls for user management
 */

import { apiClient } from './api';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    subscriptionStatus: 'trial' | 'active' | 'canceled' | 'expired';
    createdAt: string;
    planId?: string;
    plan?: {
        name: string;
    };
}

export interface UsersResponse {
    success: boolean;
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface UserFilters {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    subscriptionStatus?: string;
}

export const usersService = {
    async getUsers(filters: UserFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                params.append(key, value.toString());
            }
        });
        return apiClient.get<UsersResponse>(`/users?${params.toString()}`);
    },

    async getUserById(id: string) {
        return apiClient.get<{ success: boolean; data: User }>(`/users/${id}`);
    },

    async updateUser(id: string, data: Partial<Pick<User, 'name' | 'role' | 'subscriptionStatus'>>) {
        return apiClient.put<{ success: boolean; data: User }>(`/users/${id}`, data);
    },

    async deleteUser(id: string) {
        return apiClient.delete<{ success: boolean }>(`/users/${id}`);
    },
};

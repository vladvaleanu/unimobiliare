/**
 * Auth Service
 *
 * API calls for authentication
 */

import { apiClient } from './api';

export interface RegisterInput {
    email: string;
    password: string;
    name: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    subscriptionStatus: string;
}

export interface AuthResponse {
    user: User;
    tokens: TokenPair;
}

export const authService = {
    async register(data: RegisterInput): Promise<AuthResponse> {
        const response = await apiClient.post('/auth/register', data);
        return response.data.data;
    },

    async login(data: LoginInput): Promise<AuthResponse> {
        const response = await apiClient.post('/auth/login', data);
        return response.data.data;
    },

    async refresh(refreshToken: string): Promise<TokenPair> {
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        return response.data.data.tokens;
    },

    async logout(refreshToken: string): Promise<void> {
        await apiClient.post('/auth/logout', { refreshToken });
    },

    async logoutAll(): Promise<void> {
        await apiClient.post('/auth/logout-all');
    },
};

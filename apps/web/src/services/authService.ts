import { apiClient } from './apiClient';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
}

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

interface AuthResponse {
    user: User;
    token: string;
}

export const authService = {
    async login(credentials: LoginRequest) {
        return apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
    },

    async register(userData: RegisterRequest) {
        return apiClient.post<AuthResponse>('/api/v1/auth/register', userData);
    },

    async logout() {
        return apiClient.post('/api/v1/auth/logout');
    },

    async getCurrentUser() {
        return apiClient.get<User>('/api/v1/auth/me');
    },

    async refreshToken() {
        return apiClient.post<{ token: string }>('/api/v1/auth/refresh');
    },
};

export type { User, LoginRequest, RegisterRequest, AuthResponse };

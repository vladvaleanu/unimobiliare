import { apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
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
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export const authService = {
    async login(credentials: LoginRequest) {
        const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);

        if (response.success && response.data?.tokens) {
            tokenStorage.setTokens(
                response.data.tokens.accessToken,
                response.data.tokens.refreshToken
            );
        }

        return response;
    },

    async register(userData: RegisterRequest) {
        const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', userData);

        if (response.success && response.data?.tokens) {
            tokenStorage.setTokens(
                response.data.tokens.accessToken,
                response.data.tokens.refreshToken
            );
        }

        return response;
    },

    async logout() {
        const refreshToken = tokenStorage.getRefreshToken();
        const response = await apiClient.post('/api/v1/auth/logout', { refreshToken });
        tokenStorage.clearTokens();
        return response;
    },

    async getCurrentUser() {
        // Don't call API if no token
        if (!tokenStorage.hasToken()) {
            return { success: false, error: { message: 'No token' } };
        }
        return apiClient.get<User>('/api/v1/auth/me');
    },

    async refreshToken() {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
            return { success: false, error: { message: 'No refresh token' } };
        }

        const response = await apiClient.post<{ tokens: { accessToken: string; refreshToken: string } }>(
            '/api/v1/auth/refresh',
            { refreshToken }
        );

        if (response.success && response.data?.tokens) {
            tokenStorage.setTokens(
                response.data.tokens.accessToken,
                response.data.tokens.refreshToken
            );
        }

        return response;
    },
};

export type { User, LoginRequest, RegisterRequest, AuthResponse };

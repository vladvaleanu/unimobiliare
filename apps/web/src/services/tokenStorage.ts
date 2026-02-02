/**
 * Token Storage
 * 
 * Separate module to avoid circular dependency between apiClient and authService
 */

const TOKEN_KEY = 'unimobiliare_access_token';
const REFRESH_TOKEN_KEY = 'unimobiliare_refresh_token';

export const tokenStorage = {
    getAccessToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    },

    setTokens: (accessToken: string, refreshToken: string): void => {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    getRefreshToken: (): string | null => {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    clearTokens: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    hasToken: (): boolean => {
        return !!localStorage.getItem(TOKEN_KEY);
    },
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
    };
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            credentials: 'include', // Include cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: {
                        message: data.error?.message || 'An error occurred',
                        code: data.error?.code,
                    },
                };
            }

            return data;
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Network error',
                },
            };
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse };

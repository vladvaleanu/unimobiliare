import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService, type AuthResponse, type User, type TokenPair } from '../../services/authService';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Load initial state from localStorage
const loadInitialState = (): AuthState => {
    const accessToken = localStorage.getItem('accessToken');
    const userJson = localStorage.getItem('user');

    if (accessToken && userJson) {
        try {
            const user = JSON.parse(userJson);
            return {
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        } catch {
            // Invalid user JSON, clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    }

    return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────────────────────────────────────

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);

            // Store tokens and user
            localStorage.setItem('accessToken', response.tokens.accessToken);
            localStorage.setItem('refreshToken', response.tokens.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));

            return response;
        } catch (error: any) {
            const message = error.response?.data?.error?.message || 'Login failed';
            return rejectWithValue(message);
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (data: { email: string; password: string; name: string }, { rejectWithValue }) => {
        try {
            const response = await authService.register(data);

            // Store tokens and user
            localStorage.setItem('accessToken', response.tokens.accessToken);
            localStorage.setItem('refreshToken', response.tokens.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));

            return response;
        } catch (error: any) {
            const message = error.response?.data?.error?.message || 'Registration failed';
            return rejectWithValue(message);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await authService.logout(refreshToken);
            }
        } catch {
            // Ignore logout errors
        } finally {
            // Always clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
        return null;
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: 'auth',
    initialState: loadInitialState(),
    reducers: {
        clearError(state) {
            state.error = null;
        },
        setCredentials(state, action: PayloadAction<AuthResponse>) {
            state.user = action.payload.user;
            state.isAuthenticated = true;

            // Store in localStorage
            localStorage.setItem('accessToken', action.payload.tokens.accessToken);
            localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { ROLES, type Role } from '@unimobiliare/shared';

interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// TODO: Implement actual API calls
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            // TODO: Replace with actual API call
            // const response = await authService.login(credentials);
            // return response;

            // Mock for development
            if (credentials.email === 'admin@unimobiliare.ro' && credentials.password === 'admin123!') {
                return {
                    user: {
                        id: '1',
                        email: 'admin@unimobiliare.ro',
                        name: 'Administrator',
                        role: ROLES.ADMIN,
                    },
                    accessToken: 'mock-token',
                };
            }
            throw new Error('Invalid credentials');
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    // TODO: Call logout API
    return null;
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
        setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;

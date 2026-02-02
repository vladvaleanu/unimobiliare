import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser, clearUser, setLoading } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import type { LoginRequest, RegisterRequest } from '../services/authService';
import toast from 'react-hot-toast';

export function useAuth() {
    const dispatch = useAppDispatch();
    const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            dispatch(setLoading(true));
            const response = await authService.getCurrentUser();

            if (response.success && response.data) {
                dispatch(setUser(response.data));
            } else {
                dispatch(clearUser());
            }
        };

        checkAuth();
    }, [dispatch]);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await authService.login(credentials);

            if (response.success && response.data) {
                dispatch(setUser(response.data.user));
                toast.success('Welcome back!');
                return { success: true };
            } else {
                toast.error(response.error?.message || 'Login failed');
                return { success: false, error: response.error?.message };
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
            return { success: false, error: 'Unexpected error' };
        }
    };

    const register = async (userData: RegisterRequest) => {
        try {
            const response = await authService.register(userData);

            if (response.success && response.data) {
                dispatch(setUser(response.data.user));
                toast.success('Account created successfully!');
                return { success: true };
            } else {
                toast.error(response.error?.message || 'Registration failed');
                return { success: false, error: response.error?.message };
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
            return { success: false, error: 'Unexpected error' };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            dispatch(clearUser());
            toast.success('Logged out successfully');
        } catch (error) {
            // Still clear user on client side even if API call fails
            dispatch(clearUser());
        }
    };

    return {
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
    };
}

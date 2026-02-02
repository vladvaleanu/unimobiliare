import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

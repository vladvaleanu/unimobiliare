import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/slices/authSlice';

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        dispatch(clearError());
        dispatch(login(data));
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default',
                p: 2,
            }}
        >
            <Card sx={{ maxWidth: 400, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Logo */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Unimobiliare
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                            Admin Panel
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            {...register('email')}
                            label="Email"
                            fullWidth
                            margin="normal"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            autoComplete="email"
                        />

                        <TextField
                            {...register('password')}
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isLoading}
                            sx={{ mt: 3 }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </Button>
                    </form>

                    {/* Demo credentials hint */}
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        textAlign="center"
                        mt={3}
                    >
                        Demo: admin@unimobiliare.ro / admin123!
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

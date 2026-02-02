import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    LinearProgress,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
}

function getPasswordColor(strength: number): 'error' | 'warning' | 'success' {
    if (strength < 50) return 'error';
    if (strength < 75) return 'warning';
    return 'success';
}

export function RegisterPage() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const password = watch('password', '');

    const onPasswordChange = (value: string) => {
        setPasswordStrength(getPasswordStrength(value));
    };

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        setError(null);

        const result = await registerUser({
            name: data.name,
            email: data.email,
            password: data.password,
        });

        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Registration failed');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                p: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    {/* Logo */}
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Unimobiliare
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" mb={3}>
                        Creează un cont nou
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            fullWidth
                            label="Nume"
                            {...register('name')}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Parolă"
                            type="password"
                            {...register('password', {
                                onChange: (e) => onPasswordChange(e.target.value),
                            })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{ mb: 1 }}
                        />

                        {password && (
                            <Box sx={{ mb: 2 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={passwordStrength}
                                    color={getPasswordColor(passwordStrength)}
                                    sx={{ height: 8, borderRadius: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {passwordStrength < 50
                                        ? 'Weak password'
                                        : passwordStrength < 75
                                            ? 'Medium password'
                                            : 'Strong password'}
                                </Typography>
                            </Box>
                        )}

                        <TextField
                            fullWidth
                            label="Confirmă Parola"
                            type="password"
                            {...register('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            sx={{ mb: 3 }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{ mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Înregistrare'}
                        </Button>

                        <Box textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                Ai deja cont?{' '}
                                <Link
                                    to="/login"
                                    style={{
                                        color: '#3b82f6',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                    }}
                                >
                                    Autentifică-te
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}

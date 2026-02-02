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
    FormControlLabel,
    Checkbox,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        setError(null);

        const result = await login({
            email: data.email,
            password: data.password,
        });

        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Login failed');
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
                        Autentifică-te pentru a continua
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
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
                            {...register('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{ mb: 2 }}
                        />

                        <FormControlLabel
                            control={<Checkbox {...register('rememberMe')} />}
                            label="Ține-mă minte"
                            sx={{ mb: 2 }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{ mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Autentificare'}
                        </Button>

                        <Box textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                Nu ai cont?{' '}
                                <Link
                                    to="/register"
                                    style={{
                                        color: '#3b82f6',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                    }}
                                >
                                    Înregistrează-te
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}

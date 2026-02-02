import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Divider,
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    CardMembership,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { PlanCard } from '../components/features/PlanCard';
import { subscriptionService } from '../services/subscriptionService';
import type { Plan, Subscription } from '../services/subscriptionService';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export function SubscriptionPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        handleCheckoutResult();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        // Fetch plans
        const plansResponse = await subscriptionService.getPlans();
        if (plansResponse.success && plansResponse.data) {
            setPlans(plansResponse.data);
        }

        // Fetch current subscription if authenticated
        if (isAuthenticated) {
            const subResponse = await subscriptionService.getMySubscription();
            if (subResponse.success && subResponse.data) {
                setSubscription(subResponse.data);
            }
        }

        setLoading(false);
    };

    const handleCheckoutResult = () => {
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');

        if (success === 'true') {
            toast.success('Abonament activat cu succes!');
            // Clear URL params
            navigate('/subscription', { replace: true });
        } else if (canceled === 'true') {
            toast.error('Plata a fost anulată');
            navigate('/subscription', { replace: true });
        }
    };

    const handleSubscribe = async (planId: string) => {
        if (!isAuthenticated) {
            toast.error('Trebuie să fii autentificat pentru a te abona');
            navigate('/login');
            return;
        }

        setCheckoutLoading(true);

        const response = await subscriptionService.createCheckoutSession(planId);

        if (response.success && response.data) {
            // Redirect to Stripe Checkout
            window.location.href = response.data.url;
        } else {
            toast.error(response.error?.message || 'Failed to create checkout session');
            setCheckoutLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Ești sigur că vrei să anulezi abonamentul?')) {
            return;
        }

        const response = await subscriptionService.cancelSubscription();

        if (response.success) {
            toast.success('Abonamentul va fi anulat la sfârșitul perioadei curente');
            fetchData(); // Refresh data
        } else {
            toast.error(response.error?.message || 'Failed to cancel subscription');
        }
    };

    const handleManageSubscription = async () => {
        const response = await subscriptionService.createPortalSession();

        if (response.success && response.data) {
            window.location.href = response.data.url;
        } else {
            toast.error(response.error?.message || 'Failed to open portal');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'trialing':
                return 'info';
            case 'past_due':
                return 'warning';
            case 'canceled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Activ';
            case 'trialing':
                return 'Perioadă de probă';
            case 'past_due':
                return 'Plată restantă';
            case 'canceled':
                return 'Anulat';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, minHeight: '80vh' }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box textAlign="center" mb={6}>
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                        Planuri de Abonament
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Alege planul potrivit pentru nevoile tale
                    </Typography>
                </Box>

                {/* Checkout Success/Cancel Messages */}
                {searchParams.get('success') === 'true' && (
                    <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 3 }}>
                        Abonamentul tău a fost activat cu succes!
                    </Alert>
                )}
                {searchParams.get('canceled') === 'true' && (
                    <Alert icon={<Cancel />} severity="warning" sx={{ mb: 3 }}>
                        Plata a fost anulată. Poți încerca din nou oricând.
                    </Alert>
                )}

                {/* Current Subscription */}
                {subscription && (
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <CardMembership color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Abonamentul Tău
                            </Typography>
                            <Chip
                                label={getStatusLabel(subscription.status)}
                                color={getStatusColor(subscription.status)}
                                size="small"
                            />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Plan
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {subscription.plan.name}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Perioada curentă
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {new Date(subscription.currentPeriodStart).toLocaleDateString('ro-RO')} -{' '}
                                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('ro-RO')}
                                </Typography>
                            </Grid>
                        </Grid>

                        {subscription.cancelAtPeriodEnd && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Abonamentul va fi anulat la sfârșitul perioadei curente
                            </Alert>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box display="flex" gap={2}>
                            <Button
                                variant="outlined"
                                startIcon={<SettingsIcon />}
                                onClick={handleManageSubscription}
                            >
                                Gestionează Abonamentul
                            </Button>
                            {!subscription.cancelAtPeriodEnd && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleCancelSubscription}
                                >
                                    Anulează Abonamentul
                                </Button>
                            )}
                        </Box>
                    </Paper>
                )}

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Plans Grid */}
                <Grid container spacing={3}>
                    {plans.map((plan) => (
                        <Grid item key={plan.id} xs={12} md={4}>
                            <PlanCard
                                plan={plan}
                                currentPlanId={subscription?.planId}
                                onSubscribe={handleSubscribe}
                                loading={checkoutLoading}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* Info */}
                <Box textAlign="center" mt={6}>
                    <Typography variant="body2" color="text.secondary">
                        Toate planurile includ acces complet la platformă și suport tehnic
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Poți anula oricând, fără costuri ascunse
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

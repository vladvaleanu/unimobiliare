import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { Check, Star } from '@mui/icons-material';
import type { Plan } from '../../services/subscriptionService';

interface PlanCardProps {
    plan: Plan;
    currentPlanId?: string;
    onSubscribe: (planId: string) => void;
    loading?: boolean;
}

export function PlanCard({ plan, currentPlanId, onSubscribe, loading }: PlanCardProps) {
    const isCurrentPlan = currentPlanId === plan.id;

    const formatPrice = (price: number, currency: string, interval: string) => {
        const formattedPrice = new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: currency || 'EUR',
            maximumFractionDigits: 0,
        }).format(price);

        return `${formattedPrice}/${interval === 'month' ? 'lună' : 'an'}`;
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.isPopular ? 2 : 1,
                borderColor: plan.isPopular ? 'primary.main' : 'divider',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                },
            }}
        >
            {/* Popular Badge */}
            {plan.isPopular && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                >
                    <Chip
                        icon={<Star />}
                        label="Cel mai popular"
                        color="primary"
                        size="small"
                    />
                </Box>
            )}

            <CardContent sx={{ flexGrow: 1, pt: plan.isPopular ? 4 : 3 }}>
                {/* Plan Name */}
                <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                    textAlign="center"
                >
                    {plan.name}
                </Typography>

                {/* Price */}
                <Box textAlign="center" mb={2}>
                    <Typography variant="h3" fontWeight={700} color="primary">
                        {formatPrice(plan.price, plan.currency, plan.interval)}
                    </Typography>
                </Box>

                {/* Description */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    mb={3}
                >
                    {plan.description}
                </Typography>

                {/* Features */}
                <List dense>
                    {plan.features.map((feature, index) => (
                        <ListItem key={index} disableGutters>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Check color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={feature}
                                primaryTypographyProps={{ variant: 'body2' }}
                            />
                        </ListItem>
                    ))}
                    <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <Check color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary={`Până la ${plan.maxAlerts} alerte active`}
                            primaryTypographyProps={{ variant: 'body2' }}
                        />
                    </ListItem>
                    <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <Check color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary={`Până la ${plan.maxSavedListings} proprietăți salvate`}
                            primaryTypographyProps={{ variant: 'body2' }}
                        />
                    </ListItem>
                </List>
            </CardContent>

            {/* Actions */}
            <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                    variant={plan.isPopular ? 'contained' : 'outlined'}
                    fullWidth
                    size="large"
                    onClick={() => onSubscribe(plan.id)}
                    disabled={loading || isCurrentPlan}
                >
                    {isCurrentPlan ? 'Plan Curent' : 'Alege Planul'}
                </Button>
            </CardActions>
        </Card>
    );
}

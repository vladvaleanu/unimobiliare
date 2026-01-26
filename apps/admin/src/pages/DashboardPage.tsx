import { Typography, Grid, Card, CardContent, Box } from '@mui/material';
import {
    People as UsersIcon,
    Home as ListingsIcon,
    Extension as IntegrationsIcon,
    TrendingUp as TrendingIcon,
} from '@mui/icons-material';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: `${color}15`,
                            color: color,
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export function DashboardPage() {
    // TODO: Fetch real data from API
    const stats = {
        totalUsers: 1234,
        totalListings: 45678,
        activeIntegrations: 5,
        newListingsToday: 342,
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={4}>
                Dashboard
            </Typography>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers.toLocaleString()}
                        icon={<UsersIcon fontSize="large" />}
                        color="#3b82f6"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Listings"
                        value={stats.totalListings.toLocaleString()}
                        icon={<ListingsIcon fontSize="large" />}
                        color="#22c55e"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Active Integrations"
                        value={stats.activeIntegrations}
                        icon={<IntegrationsIcon fontSize="large" />}
                        color="#8b5cf6"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="New Today"
                        value={stats.newListingsToday.toLocaleString()}
                        icon={<TrendingIcon fontSize="large" />}
                        color="#f59e0b"
                    />
                </Grid>
            </Grid>

            {/* TODO: Add charts and recent activity */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Quick Actions
                    </Typography>
                    <Typography color="text.secondary">
                        Create integrations, manage users, and configure subscription plans from the sidebar menu.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

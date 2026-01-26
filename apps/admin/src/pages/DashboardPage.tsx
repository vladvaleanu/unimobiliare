import { Typography, Grid, Card, CardContent, Box, Button, List, ListItem, ListItemText, ListItemIcon, Chip } from '@mui/material';
import {
    People as UsersIcon,
    Home as ListingsIcon,
    Extension as IntegrationsIcon,
    TrendingUp as TrendingIcon,
    CheckCircle as SuccessIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card Component
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    change?: string;
    changeType?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, icon, color, change, changeType }: StatCardProps) {
    const changeColor = changeType === 'up' ? '#22c55e' : changeType === 'down' ? '#ef4444' : '#94a3b8';

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
                        {change && (
                            <Typography variant="caption" sx={{ color: changeColor }}>
                                {change}
                            </Typography>
                        )}
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

// ─────────────────────────────────────────────────────────────────────────────
// Recent Activity Component
// ─────────────────────────────────────────────────────────────────────────────

interface ActivityItem {
    id: string;
    type: 'success' | 'warning' | 'error';
    message: string;
    timestamp: string;
}

function RecentActivity() {
    // TODO: Fetch from API
    const activities: ActivityItem[] = [
        { id: '1', type: 'success', message: 'Imobiliare.ro sync completed - 342 listings', timestamp: '5 min ago' },
        { id: '2', type: 'success', message: 'OLX sync completed - 215 listings', timestamp: '15 min ago' },
        { id: '3', type: 'warning', message: 'Storia.ro rate limited - retrying in 5 min', timestamp: '30 min ago' },
        { id: '4', type: 'success', message: 'New user registered: john@example.com', timestamp: '1 hour ago' },
        { id: '5', type: 'error', message: 'Publi24 connection failed', timestamp: '2 hours ago' },
    ];

    const getIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'success': return <SuccessIcon color="success" />;
            case 'warning': return <WarningIcon color="warning" />;
            case 'error': return <ErrorIcon color="error" />;
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Recent Activity
                </Typography>
                <List dense>
                    {activities.map((activity) => (
                        <ListItem key={activity.id} disablePadding sx={{ py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {getIcon(activity.type)}
                            </ListItemIcon>
                            <ListItemText
                                primary={activity.message}
                                secondary={activity.timestamp}
                                primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Integration Status Component
// ─────────────────────────────────────────────────────────────────────────────

interface IntegrationStatus {
    name: string;
    status: 'active' | 'warning' | 'error' | 'idle';
    lastSync: string;
    listings: number;
}

function IntegrationStatusCard() {
    // TODO: Fetch from API
    const integrations: IntegrationStatus[] = [
        { name: 'Imobiliare.ro', status: 'active', lastSync: '5 min ago', listings: 15234 },
        { name: 'OLX', status: 'active', lastSync: '15 min ago', listings: 8543 },
        { name: 'Storia.ro', status: 'warning', lastSync: '30 min ago', listings: 5421 },
        { name: 'Publi24', status: 'error', lastSync: '2 hours ago', listings: 3210 },
    ];

    const getStatusColor = (status: IntegrationStatus['status']) => {
        switch (status) {
            case 'active': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'error';
            case 'idle': return 'default';
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Integrations Status
                    </Typography>
                    <Button size="small" color="primary">
                        View All
                    </Button>
                </Box>
                <List dense>
                    {integrations.map((integration) => (
                        <ListItem key={integration.name} disablePadding sx={{ py: 1 }}>
                            <ListItemText
                                primary={integration.name}
                                secondary={`${integration.listings.toLocaleString()} listings • ${integration.lastSync}`}
                                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                            />
                            <Chip
                                label={integration.status}
                                color={getStatusColor(integration.status)}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────────────────────────────────────────

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

            {/* Stats Grid */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers.toLocaleString()}
                        icon={<UsersIcon fontSize="large" />}
                        color="#3b82f6"
                        change="+12% vs last month"
                        changeType="up"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Listings"
                        value={stats.totalListings.toLocaleString()}
                        icon={<ListingsIcon fontSize="large" />}
                        color="#22c55e"
                        change="+8% vs last week"
                        changeType="up"
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
                        change="+5% vs yesterday"
                        changeType="up"
                    />
                </Grid>
            </Grid>

            {/* Bottom Grid */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <RecentActivity />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <IntegrationStatusCard />
                </Grid>
            </Grid>
        </Box>
    );
}

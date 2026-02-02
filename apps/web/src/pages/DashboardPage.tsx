import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Button,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    Search as SearchIcon,
    Favorite,
    Notifications,
    TrendingUp,
    CardMembership,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface DashboardStats {
    savedListings: number;
    activeAlerts: number;
    newListings: number;
}

export function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        savedListings: 0,
        activeAlerts: 0,
        newListings: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch real stats from API
        setTimeout(() => {
            setStats({
                savedListings: 12,
                activeAlerts: 3,
                newListings: 5,
            });
            setLoading(false);
        }, 500);
    }, []);

    const quickActions = [
        {
            title: 'Căutare Proprietăți',
            description: 'Caută noi proprietăți',
            icon: <SearchIcon sx={{ fontSize: 40 }} />,
            color: '#3b82f6',
            action: () => navigate('/search'),
        },
        {
            title: 'Proprietăți Salvate',
            description: `${stats.savedListings} proprietăți`,
            icon: <Favorite sx={{ fontSize: 40 }} />,
            color: '#ef4444',
            action: () => navigate('/saved'),
        },
        {
            title: 'Alerte Active',
            description: `${stats.activeAlerts} alerte`,
            icon: <Notifications sx={{ fontSize: 40 }} />,
            color: '#f59e0b',
            action: () => { }, // TODO: Navigate to alerts page
        },
        {
            title: 'Abonament',
            description: 'Gestionează abonamentul',
            icon: <CardMembership sx={{ fontSize: 40 }} />,
            color: '#8b5cf6',
            action: () => navigate('/subscription'),
        },
    ];

    return (
        <Box sx={{ py: 4, minHeight: '80vh' }}>
            <Container maxWidth="xl">
                {/* Welcome Section */}
                <Box mb={4}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Bun venit, {user?.name}! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Aici găsești un rezumat al activității tale
                    </Typography>
                </Box>

                {loading && <LinearProgress sx={{ mb: 3 }} />}

                {/* Stats Cards */}
                <Grid container spacing={3} mb={4}>
                    {quickActions.map((action, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    },
                                }}
                                onClick={action.action}
                            >
                                <CardContent>
                                    <Box
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: `${action.color}20`,
                                            color: action.color,
                                            mb: 2,
                                        }}
                                    >
                                        {action.icon}
                                    </Box>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        {action.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {action.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Recent Activity */}
                <Grid container spacing={3}>
                    {/* New Listings */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <TrendingUp color="primary" />
                                <Typography variant="h6" fontWeight={600}>
                                    Anunțuri Noi
                                </Typography>
                                <Chip label={stats.newListings} size="small" color="primary" />
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Proprietăți noi care se potrivesc criteriilor tale
                            </Typography>
                            <Button variant="outlined" onClick={() => navigate('/search')}>
                                Vezi Toate
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Saved Listings */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Favorite color="error" />
                                <Typography variant="h6" fontWeight={600}>
                                    Proprietăți Salvate
                                </Typography>
                                <Chip label={stats.savedListings} size="small" color="error" />
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Proprietățile tale favorite
                            </Typography>
                            <Button variant="outlined" onClick={() => navigate('/saved')}>
                                Vezi Favorite
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import { Search as SearchIcon, TrendingUp, Security, Speed } from '@mui/icons-material';

export function HomePage() {
    const navigate = useNavigate();

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                    textAlign: 'center',
                    p: 2,
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                            : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Unimobiliare
                </Typography>

                <Typography variant="h5" color="text.secondary" mb={2} maxWidth={600}>
                    Platforma de Unificare Imobiliară din România
                </Typography>

                <Typography color="text.secondary" mb={4} maxWidth={600}>
                    Agregăm automat anunțurile de pe principalele platforme, eliminăm duplicatele
                    și te alertăm instant când apare ceva nou pentru tine.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SearchIcon />}
                        onClick={() => navigate('/search')}
                    >
                        Începe Căutarea
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => {
                            const element = document.getElementById('features');
                            element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        Află Mai Multe
                    </Button>
                </Box>
            </Box>

            {/* Features Section */}
            <Container id="features" maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h4" fontWeight={700} textAlign="center" mb={4}>
                    De ce Unimobiliare?
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Speed sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Rapiditate
                                </Typography>
                                <Typography color="text.secondary">
                                    Primești alerte instant când apare un anunț nou care se potrivește criteriilor tale.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <TrendingUp sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Istoric Prețuri
                                </Typography>
                                <Typography color="text.secondary">
                                    Vezi evoluția prețurilor și ia decizii informate bazate pe date reale.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Security sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Anti-Duplicat
                                </Typography>
                                <Typography color="text.secondary">
                                    Eliminăm duplicatele dintre platforme folosind AI pentru a-ți economisi timp.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

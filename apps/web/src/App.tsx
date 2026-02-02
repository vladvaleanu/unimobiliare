import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, Grid, Card, CardContent } from '@mui/material';
import { Search as SearchIcon, TrendingUp, Security, Speed } from '@mui/icons-material';

function HomePage() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            }}
        >
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
                <Typography variant="h4" fontWeight={700} textAlign="center" color="white" mb={4}>
                    De ce Unimobiliare?
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Speed sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" color="white" gutterBottom>
                                    Rapiditate
                                </Typography>
                                <Typography color="text.secondary">
                                    Primești alerte instant când apare un anunț nou care se potrivește criteriilor tale.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <TrendingUp sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                                <Typography variant="h6" color="white" gutterBottom>
                                    Istoric Prețuri
                                </Typography>
                                <Typography color="text.secondary">
                                    Vezi evoluția prețurilor și ia decizii informate bazate pe date reale.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Security sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                                <Typography variant="h6" color="white" gutterBottom>
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

            {/* Footer */}
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                    © 2026 Unimobiliare. Toate drepturile rezervate.
                </Typography>
            </Box>
        </Box>
    );
}

function SearchPage() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                p: 4,
            }}
        >
            <Container maxWidth="lg">
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            cursor: 'pointer',
                        }}
                        onClick={() => navigate('/')}
                    >
                        Unimobiliare
                    </Typography>
                    <Box display="flex" gap={2}>
                        <Button variant="outlined" onClick={() => navigate('/login')}>
                            Autentificare
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/register')}>
                            Înregistrare
                        </Button>
                    </Box>
                </Box>

                {/* Search Section */}
                <Paper sx={{ p: 4, backgroundColor: 'rgba(255,255,255,0.05)', mb: 4 }}>
                    <Typography variant="h5" color="white" mb={3}>
                        Caută Proprietăți
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <Box
                                component="select"
                                sx={{
                                    width: '100%',
                                    p: 1.5,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 1,
                                    color: 'white',
                                    fontSize: '1rem',
                                }}
                            >
                                <option value="">Tip Proprietate</option>
                                <option value="apartment">Apartament</option>
                                <option value="house">Casă</option>
                                <option value="land">Teren</option>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box
                                component="select"
                                sx={{
                                    width: '100%',
                                    p: 1.5,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 1,
                                    color: 'white',
                                    fontSize: '1rem',
                                }}
                            >
                                <option value="">Oraș</option>
                                <option value="bucuresti">București</option>
                                <option value="cluj">Cluj-Napoca</option>
                                <option value="timisoara">Timișoara</option>
                                <option value="iasi">Iași</option>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Box
                                component="input"
                                type="number"
                                placeholder="Preț min"
                                sx={{
                                    width: '100%',
                                    p: 1.5,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 1,
                                    color: 'white',
                                    fontSize: '1rem',
                                    '&::placeholder': { color: 'rgba(255,255,255,0.5)' },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Box
                                component="input"
                                type="number"
                                placeholder="Preț max"
                                sx={{
                                    width: '100%',
                                    p: 1.5,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 1,
                                    color: 'white',
                                    fontSize: '1rem',
                                    '&::placeholder': { color: 'rgba(255,255,255,0.5)' },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<SearchIcon />}
                                sx={{ py: 1.5 }}
                            >
                                Caută
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Results Placeholder */}
                <Paper sx={{ p: 4, backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <Typography color="text.secondary" py={8}>
                        🔍 Introdu criteriile de căutare pentru a vedea rezultatele
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            {/* Placeholder routes */}
            <Route path="/login" element={<Box p={4}><Typography color="white">Login - Coming Soon</Typography></Box>} />
            <Route path="/register" element={<Box p={4}><Typography color="white">Register - Coming Soon</Typography></Box>} />
        </Routes>
    );
}

export default App;


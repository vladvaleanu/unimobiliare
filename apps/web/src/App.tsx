import { Routes, Route } from 'react-router-dom';
import { Box, Typography, Container, Button } from '@mui/material';

function HomePage() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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

            <Typography variant="h5" color="text.secondary" mb={4} maxWidth={600}>
                Platforma de Unificare Imobiliară din România
            </Typography>

            <Typography color="text.secondary" mb={4} maxWidth={600}>
                Agregăm automat anunțurile de pe principalele platforme, eliminăm duplicatele
                și te alertăm instant când apare ceva nou pentru tine.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" size="large">
                    Începe Căutarea
                </Button>
                <Button variant="outlined" size="large">
                    Află Mai Multe
                </Button>
            </Box>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ position: 'absolute', bottom: 24 }}
            >
                🚧 Site în construcție - Coming Soon
            </Typography>
        </Box>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            {/* TODO: Add more routes */}
            {/* <Route path="/search" element={<SearchPage />} /> */}
            {/* <Route path="/listing/:id" element={<ListingPage />} /> */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            {/* <Route path="/register" element={<RegisterPage />} /> */}
            {/* <Route path="/dashboard" element={<UserDashboardPage />} /> */}
        </Routes>
    );
}

export default App;

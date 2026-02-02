import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                py: 4,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[900],
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                            Unimobiliare
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Platforma de unificare imobiliară din România
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            Link-uri Utile
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <MuiLink component={Link} to="/search" color="text.secondary">
                                Căutare Proprietăți
                            </MuiLink>
                            <MuiLink component={Link} to="/subscription" color="text.secondary">
                                Planuri Abonament
                            </MuiLink>
                            <MuiLink component={Link} to="/about" color="text.secondary">
                                Despre Noi
                            </MuiLink>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            Legal
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <MuiLink href="#" color="text.secondary">
                                Termeni și Condiții
                            </MuiLink>
                            <MuiLink href="#" color="text.secondary">
                                Politică de Confidențialitate
                            </MuiLink>
                            <MuiLink href="#" color="text.secondary">
                                Contact
                            </MuiLink>
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} Unimobiliare. Toate drepturile rezervate.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

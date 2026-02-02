import { Link, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Container,
} from '@mui/material';
import {
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    AccountCircle,
    Dashboard,
    Favorite,
    CardMembership,
    Logout,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleTheme } from '../../store/slices/themeSlice';

export function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logout();
        handleClose();
        navigate('/');
    };

    return (
        <AppBar position="sticky" color="default" elevation={1}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Logo */}
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textDecoration: 'none',
                            mr: 4,
                        }}
                    >
                        Unimobiliare
                    </Typography>

                    {/* Navigation Links */}
                    <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                        <Button color="inherit" component={Link} to="/search">
                            Căutare
                        </Button>
                        {isAuthenticated && (
                            <>
                                <Button color="inherit" component={Link} to="/dashboard">
                                    Dashboard
                                </Button>
                                <Button color="inherit" component={Link} to="/saved">
                                    Favorite
                                </Button>
                            </>
                        )}
                    </Box>

                    {/* Theme Toggle */}
                    <IconButton
                        onClick={() => dispatch(toggleTheme())}
                        color="inherit"
                        sx={{ mr: 1 }}
                    >
                        {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>

                    {/* User Menu or Login/Register */}
                    {isAuthenticated ? (
                        <>
                            <IconButton
                                size="large"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem disabled>
                                    <Typography variant="body2" color="text.secondary">
                                        {user?.email}
                                    </Typography>
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        navigate('/dashboard');
                                        handleClose();
                                    }}
                                >
                                    <Dashboard sx={{ mr: 1 }} fontSize="small" />
                                    Dashboard
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        navigate('/saved');
                                        handleClose();
                                    }}
                                >
                                    <Favorite sx={{ mr: 1 }} fontSize="small" />
                                    Favorite
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        navigate('/subscription');
                                        handleClose();
                                    }}
                                >
                                    <CardMembership sx={{ mr: 1 }} fontSize="small" />
                                    Abonament
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <Logout sx={{ mr: 1 }} fontSize="small" />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button color="inherit" component={Link} to="/login">
                                Login
                            </Button>
                            <Button variant="contained" component={Link} to="/register">
                                Înregistrare
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
}

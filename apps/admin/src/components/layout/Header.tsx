import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Avatar,
    Menu,
    MenuItem,
} from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        dispatch(logout());
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onMenuClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ flexGrow: 1 }} />

                {/* User Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {user?.name}
                    </Typography>
                    <IconButton onClick={handleMenuOpen} size="small">
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                backgroundColor: 'primary.main',
                                fontSize: '0.875rem',
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                    </IconButton>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={handleLogout}>
                        <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}

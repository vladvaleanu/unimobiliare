import { NavLink, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Extension as IntegrationIcon,
    People as UsersIcon,
    CardMembership as PlansIcon,
    SmartToy as AIIcon,
    History as AuditIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';

interface SidebarProps {
    open: boolean;
    width: number;
}

const menuItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/integrations', label: 'Integrations', icon: <IntegrationIcon /> },
    { path: '/users', label: 'Users', icon: <UsersIcon /> },
    { path: '/plans', label: 'Subscription Plans', icon: <PlansIcon /> },
    { path: '/ai-settings', label: 'AI Settings', icon: <AIIcon /> },
    { path: '/audit-log', label: 'Audit Log', icon: <AuditIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export function Sidebar({ open, width }: SidebarProps) {
    const location = useLocation();

    return (
        <Drawer
            variant="persistent"
            open={open}
            sx={{
                width: open ? width : 0,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width,
                    boxSizing: 'border-box',
                    backgroundColor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                },
            }}
        >
            {/* Logo */}
            <Box sx={{ p: 3 }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Unimobiliare
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Admin Panel
                </Typography>
            </Box>

            <Divider />

            {/* Navigation */}
            <List sx={{ px: 2, py: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={NavLink}
                                to={item.path}
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: isActive
                                            ? 'rgba(59, 130, 246, 0.15)'
                                            : 'rgba(148, 163, 184, 0.08)',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: isActive ? 'primary.main' : 'text.secondary',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? 'primary.main' : 'text.primary',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
}

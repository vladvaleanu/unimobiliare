import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Switch,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreIcon,
    PlayArrow as PlayIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

interface Integration {
    id: string;
    name: string;
    displayName: string;
    enabled: boolean;
    lastSync: string | null;
    lastSyncStatus: 'success' | 'failed' | 'running' | 'idle';
    listingsCount: number;
}

// TODO: Replace with API data
const mockIntegrations: Integration[] = [
    { id: '1', name: 'imobiliare-ro', displayName: 'Imobiliare.ro', enabled: true, lastSync: '2026-01-26T18:45:00', lastSyncStatus: 'success', listingsCount: 15234 },
    { id: '2', name: 'olx', displayName: 'OLX', enabled: true, lastSync: '2026-01-26T18:30:00', lastSyncStatus: 'success', listingsCount: 8543 },
    { id: '3', name: 'storia-ro', displayName: 'Storia.ro', enabled: true, lastSync: '2026-01-26T18:00:00', lastSyncStatus: 'failed', listingsCount: 5421 },
    { id: '4', name: 'publi24', displayName: 'Publi24', enabled: false, lastSync: null, lastSyncStatus: 'idle', listingsCount: 0 },
];

export function IntegrationsPage() {
    const [integrations, setIntegrations] = useState(mockIntegrations);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedId(null);
    };

    const handleToggleEnabled = (id: string) => {
        setIntegrations(prev =>
            prev.map(int => int.id === id ? { ...int, enabled: !int.enabled } : int)
        );
    };

    const getStatusColor = (status: Integration['lastSyncStatus']) => {
        switch (status) {
            case 'success': return 'success';
            case 'failed': return 'error';
            case 'running': return 'info';
            case 'idle': return 'default';
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleString();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Integrations
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />}>
                    New Integration
                </Button>
            </Box>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Platform</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Sync</TableCell>
                                <TableCell align="right">Listings</TableCell>
                                <TableCell align="center">Enabled</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {integrations.map((integration) => (
                                <TableRow key={integration.id} hover>
                                    <TableCell>
                                        <Typography fontWeight={500}>{integration.displayName}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {integration.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={integration.lastSyncStatus}
                                            color={getStatusColor(integration.lastSyncStatus)}
                                            size="small"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(integration.lastSync)}</TableCell>
                                    <TableCell align="right">
                                        {integration.listingsCount.toLocaleString()}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Switch
                                            checked={integration.enabled}
                                            onChange={() => handleToggleEnabled(integration.id)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" title="Run Sync">
                                            <PlayIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, integration.id)}
                                        >
                                            <MoreIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>
        </Box>
    );
}

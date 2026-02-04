/**
 * Integrations Page
 * 
 * Admin page for managing website integrations.
 * Lists all integrations with controls to enable/disable, sync, edit, delete.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
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
    CircularProgress,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreIcon,
    PlayArrow as PlayIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { integrationsService, Integration } from '../services/integrationsService';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function IntegrationsPage() {
    const navigate = useNavigate();

    // State
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // Data Loading
    // ─────────────────────────────────────────────────────────────────────────

    const loadIntegrations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await integrationsService.getAll();
            setIntegrations(response.data || []);
        } catch (err) {
            console.error('Failed to load integrations:', err);
            setError('Failed to load integrations. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadIntegrations();
    }, [loadIntegrations]);

    // ─────────────────────────────────────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedId(null);
    };

    const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
        try {
            await integrationsService.toggleEnabled(id, !currentEnabled);
            setIntegrations(prev =>
                prev.map(int => int.id === id ? { ...int, enabled: !currentEnabled } : int)
            );
            setSnackbar({
                open: true,
                message: `Integration ${!currentEnabled ? 'enabled' : 'disabled'} successfully`,
                severity: 'success',
            });
        } catch (err) {
            console.error('Failed to toggle integration:', err);
            setSnackbar({
                open: true,
                message: 'Failed to update integration status',
                severity: 'error',
            });
        }
    };

    const handleTriggerSync = async (id: string) => {
        try {
            setSyncingId(id);
            await integrationsService.triggerSync(id);
            setIntegrations(prev =>
                prev.map(int => int.id === id ? { ...int, lastSyncStatus: 'running' as const } : int)
            );
            setSnackbar({
                open: true,
                message: 'Sync triggered successfully. Check back shortly for results.',
                severity: 'success',
            });
        } catch (err) {
            console.error('Failed to trigger sync:', err);
            setSnackbar({
                open: true,
                message: 'Failed to trigger sync',
                severity: 'error',
            });
        } finally {
            setSyncingId(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedId) return;

        try {
            await integrationsService.delete(selectedId);
            setIntegrations(prev => prev.filter(int => int.id !== selectedId));
            setSnackbar({
                open: true,
                message: 'Integration deleted successfully',
                severity: 'success',
            });
        } catch (err) {
            console.error('Failed to delete integration:', err);
            setSnackbar({
                open: true,
                message: 'Failed to delete integration',
                severity: 'error',
            });
        } finally {
            setDeleteDialogOpen(false);
            handleMenuClose();
        }
    };

    const handleEdit = () => {
        if (selectedId) {
            navigate(`/integrations/${selectedId}/edit`);
        }
        handleMenuClose();
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={loadIntegrations}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Integrations
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadIntegrations}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/integrations/new')}
                    >
                        New Integration
                    </Button>
                </Box>
            </Box>

            {integrations.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No integrations configured
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Get started by creating your first integration using the Integration Builder.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/integrations/new')}
                    >
                        Create Integration
                    </Button>
                </Card>
            ) : (
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
                                        <TableCell>{formatDate(integration.lastSyncAt)}</TableCell>
                                        <TableCell align="right">
                                            {(integration.totalListings || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={integration.enabled}
                                                onChange={() => handleToggleEnabled(integration.id, integration.enabled)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                title="Run Sync"
                                                onClick={() => handleTriggerSync(integration.id)}
                                                disabled={!integration.enabled || syncingId === integration.id || integration.lastSyncStatus === 'running'}
                                            >
                                                {syncingId === integration.id ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <PlayIcon />
                                                )}
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
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setDeleteDialogOpen(true);
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Integration</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this integration? This action cannot be undone.
                        All associated listings will also be removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

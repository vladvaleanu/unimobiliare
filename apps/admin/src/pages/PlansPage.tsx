import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Grid,
    InputAdornment,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';

interface SubscriptionPlan {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    priceMonthly: number;
    priceYearly: number;
    trialDays: number;
    isActive: boolean;
    isFeatured: boolean;
    displayOrder: number;
    limits: Record<string, number>;
    features: Record<string, boolean>;
}

const defaultPlan: Partial<SubscriptionPlan> = {
    name: '',
    slug: '',
    description: '',
    priceMonthly: 0,
    priceYearly: 0,
    trialDays: 0,
    isActive: true,
    isFeatured: false,
    limits: {
        maxSearchProfiles: 1,
        maxSavedListings: 10,
        maxAlertsPerDay: 1,
    },
    features: {
        aiFeatures: false,
        exportData: false,
        priceHistory: false,
        prioritySupport: false,
    },
};

export function PlansPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
    const [saving, setSaving] = useState(false);

    // Fetch plans
    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/plans', {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setPlans(data.data);
            }
        } catch (err) {
            setError('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (plan?: SubscriptionPlan) => {
        setEditingPlan(plan || { ...defaultPlan });
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingPlan(null);
    };

    const handleSave = async () => {
        if (!editingPlan) return;

        setSaving(true);
        try {
            const isNew = !editingPlan.id;
            const url = isNew ? '/api/v1/plans' : `/api/v1/plans/${editingPlan.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editingPlan),
            });

            if (response.ok) {
                await fetchPlans();
                handleCloseDialog();
            } else {
                const data = await response.json();
                setError(data.error?.message || 'Failed to save plan');
            }
        } catch (err) {
            setError('Failed to save plan');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (plan: SubscriptionPlan) => {
        try {
            await fetch(`/api/v1/plans/${plan.id}/toggle-active`, {
                method: 'PATCH',
                credentials: 'include',
            });
            await fetchPlans();
        } catch (err) {
            setError('Failed to update plan');
        }
    };

    const handleToggleFeatured = async (plan: SubscriptionPlan) => {
        try {
            await fetch(`/api/v1/plans/${plan.id}/toggle-featured`, {
                method: 'PATCH',
                credentials: 'include',
            });
            await fetchPlans();
        } catch (err) {
            setError('Failed to update plan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        try {
            await fetch(`/api/v1/plans/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            await fetchPlans();
        } catch (err) {
            setError('Failed to delete plan');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Subscription Plans
                    </Typography>
                    <Typography color="text.secondary">
                        Manage subscription tiers and pricing
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Plan
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Plans Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Monthly Price</TableCell>
                            <TableCell>Yearly Price</TableCell>
                            <TableCell>Trial Days</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Featured</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary" py={4}>
                                        No subscription plans yet. Create your first plan!
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            plans.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell>
                                        <Typography fontWeight={600}>{plan.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {plan.slug}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{plan.priceMonthly} RON</TableCell>
                                    <TableCell>{plan.priceYearly} RON</TableCell>
                                    <TableCell>{plan.trialDays} days</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={plan.isActive ? 'Active' : 'Inactive'}
                                            color={plan.isActive ? 'success' : 'default'}
                                            size="small"
                                            onClick={() => handleToggleActive(plan)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleToggleFeatured(plan)}
                                            color={plan.isFeatured ? 'warning' : 'default'}
                                        >
                                            {plan.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(plan)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(plan.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingPlan?.id ? 'Edit Plan' : 'Create New Plan'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Plan Name"
                                value={editingPlan?.name || ''}
                                onChange={(e) =>
                                    setEditingPlan({ ...editingPlan, name: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Slug"
                                value={editingPlan?.slug || ''}
                                onChange={(e) =>
                                    setEditingPlan({ ...editingPlan, slug: e.target.value })
                                }
                                helperText="URL-friendly identifier"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={2}
                                value={editingPlan?.description || ''}
                                onChange={(e) =>
                                    setEditingPlan({ ...editingPlan, description: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Monthly Price"
                                value={editingPlan?.priceMonthly || 0}
                                onChange={(e) =>
                                    setEditingPlan({
                                        ...editingPlan,
                                        priceMonthly: parseFloat(e.target.value),
                                    })
                                }
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">RON</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Yearly Price"
                                value={editingPlan?.priceYearly || 0}
                                onChange={(e) =>
                                    setEditingPlan({
                                        ...editingPlan,
                                        priceYearly: parseFloat(e.target.value),
                                    })
                                }
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">RON</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Trial Days"
                                value={editingPlan?.trialDays || 0}
                                onChange={(e) =>
                                    setEditingPlan({
                                        ...editingPlan,
                                        trialDays: parseInt(e.target.value),
                                    })
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editingPlan?.isActive || false}
                                        onChange={(e) =>
                                            setEditingPlan({
                                                ...editingPlan,
                                                isActive: e.target.checked,
                                            })
                                        }
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editingPlan?.isFeatured || false}
                                        onChange={(e) =>
                                            setEditingPlan({
                                                ...editingPlan,
                                                isFeatured: e.target.checked,
                                            })
                                        }
                                    />
                                }
                                label="Featured"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

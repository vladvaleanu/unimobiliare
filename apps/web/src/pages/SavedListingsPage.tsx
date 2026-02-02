import { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Pagination,
    Button,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PropertyCard } from '../components/features/PropertyCard';
import { listingService } from '../services/listingService';
import type { Listing } from '../services/listingService';
import toast from 'react-hot-toast';

export function SavedListingsPage() {
    const navigate = useNavigate();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchSavedListings();
    }, [page]);

    const fetchSavedListings = async () => {
        setLoading(true);
        setError(null);

        const response = await listingService.getSavedListings(page, 12);

        setLoading(false);

        if (response.success && response.data) {
            setListings(response.data.listings);
            setTotalPages(response.data.totalPages);
        } else {
            setError(response.error?.message || 'Failed to load saved listings');
        }
    };

    const handleUnsave = async (listingId: string) => {
        const response = await listingService.unsaveListing(listingId);

        if (response.success) {
            // Remove from local state
            setListings((prev) => prev.filter((listing) => listing.id !== listingId));
            toast.success('Removed from favorites');
        } else {
            toast.error(response.error?.message || 'Failed to remove listing');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, minHeight: '80vh' }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box mb={4}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Proprietăți Salvate ❤️
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Proprietățile tale favorite
                    </Typography>
                </Box>

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Empty State */}
                {!loading && listings.length === 0 ? (
                    <Box textAlign="center" py={8}>
                        <Typography variant="h5" gutterBottom>
                            📭 Nu ai proprietăți salvate
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={3}>
                            Începe să salvezi proprietăți pentru a le vedea aici
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={() => navigate('/search')}
                        >
                            Caută Proprietăți
                        </Button>
                    </Box>
                ) : (
                    <>
                        {/* Results Count */}
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            {listings.length} proprietăți salvate
                        </Typography>

                        {/* Listings Grid */}
                        <Grid container spacing={3}>
                            {listings.map((listing) => (
                                <Grid item key={listing.id} xs={12} sm={6} md={4} lg={3}>
                                    <PropertyCard
                                        listing={{ ...listing, isSaved: true }}
                                        onSaveToggle={(id) => handleUnsave(id)}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box display="flex" justifyContent="center" mt={4}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(_, value) => setPage(value)}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
}

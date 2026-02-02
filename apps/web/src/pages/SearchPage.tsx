import { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    Pagination,
    CircularProgress,
    Alert,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import { ViewModule, ViewList } from '@mui/icons-material';
import { SearchFiltersComponent } from '../components/features/SearchFilters';
import { PropertyCard } from '../components/features/PropertyCard';
import { listingService } from '../services/listingService';
import type { SearchFilters, Listing } from '../services/listingService';
import toast from 'react-hot-toast';

export function SearchPage() {
    const [filters, setFilters] = useState<SearchFilters>({});
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        handleSearch();
    }, [page]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);

        const response = await listingService.searchListings({
            ...filters,
            page,
            limit: 12,
        });

        setLoading(false);

        if (response.success && response.data) {
            setListings(response.data.listings || []);
            setTotalPages(response.data.totalPages || 1);
        } else {
            setListings([]);
            setError(response.error?.message || 'Failed to load listings');
        }
    };

    const handleFiltersChange = (newFilters: SearchFilters) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    const handleSaveToggle = async (listingId: string, isSaved: boolean) => {
        const response = isSaved
            ? await listingService.saveListing(listingId)
            : await listingService.unsaveListing(listingId);

        if (response.success) {
            // Update local state
            setListings((prev) =>
                prev.map((listing) =>
                    listing.id === listingId ? { ...listing, isSaved } : listing
                )
            );
            toast.success(isSaved ? 'Listing saved!' : 'Listing removed from favorites');
        } else {
            toast.error(response.error?.message || 'Failed to update listing');
        }
    };

    return (
        <Box sx={{ py: 4, minHeight: '80vh' }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" fontWeight={700}>
                        Căutare Proprietăți
                    </Typography>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, newMode) => newMode && setViewMode(newMode)}
                        size="small"
                    >
                        <ToggleButton value="grid">
                            <ViewModule />
                        </ToggleButton>
                        <ToggleButton value="list">
                            <ViewList />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Filters */}
                <SearchFiltersComponent
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onSearch={handleSearch}
                />

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Loading */}
                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Results Count */}
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            {listings.length > 0
                                ? `${listings.length} rezultate găsite`
                                : 'Niciun rezultat găsit'}
                        </Typography>

                        {/* Listings Grid */}
                        {listings.length > 0 ? (
                            <>
                                <Grid container spacing={3}>
                                    {listings.map((listing) => (
                                        <Grid
                                            item
                                            key={listing.id}
                                            xs={12}
                                            sm={viewMode === 'grid' ? 6 : 12}
                                            md={viewMode === 'grid' ? 4 : 12}
                                            lg={viewMode === 'grid' ? 3 : 12}
                                        >
                                            <PropertyCard
                                                listing={listing}
                                                onSaveToggle={handleSaveToggle}
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
                        ) : (
                            <Box textAlign="center" py={8}>
                                <Typography variant="h6" color="text.secondary">
                                    🔍 Niciun rezultat găsit
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Încearcă să modifici filtrele de căutare
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
}

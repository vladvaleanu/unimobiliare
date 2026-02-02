import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    ImageList,
    ImageListItem,
    Divider,
} from '@mui/material';
import {
    ArrowBack,
    Favorite,
    FavoriteBorder,
    LocationOn,
    Bed,
    Bathtub,
    SquareFoot,
    CalendarToday,
    OpenInNew,
} from '@mui/icons-material';
import { listingService } from '../services/listingService';
import type { Listing } from '../services/listingService';
import toast from 'react-hot-toast';

export function ListingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchListing(id);
        }
    }, [id]);

    const fetchListing = async (listingId: string) => {
        setLoading(true);
        const response = await listingService.getListingById(listingId);
        setLoading(false);

        if (response.success && response.data) {
            setListing(response.data);
        } else {
            setError(response.error?.message || 'Failed to load listing');
        }
    };

    const handleSaveToggle = async () => {
        if (!listing) return;

        const response = listing.isSaved
            ? await listingService.unsaveListing(listing.id)
            : await listingService.saveListing(listing.id);

        if (response.success) {
            setListing({ ...listing, isSaved: !listing.isSaved });
            toast.success(listing.isSaved ? 'Removed from favorites' : 'Added to favorites');
        } else {
            toast.error(response.error?.message || 'Failed to update listing');
        }
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: currency || 'EUR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !listing) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Listing not found'}</Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/search')} sx={{ mt: 2 }}>
                    Înapoi la Căutare
                </Button>
            </Container>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/search')}
                    sx={{ mb: 2 }}
                >
                    Înapoi la Căutare
                </Button>

                <Grid container spacing={4}>
                    {/* Images */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 0, overflow: 'hidden' }}>
                            <ImageList cols={2} gap={8}>
                                {listing.images.map((image, index) => (
                                    <ImageListItem key={index}>
                                        <img
                                            src={image}
                                            alt={`${listing.title} - ${index + 1}`}
                                            loading="lazy"
                                            style={{ height: 300, objectFit: 'cover' }}
                                        />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </Paper>
                    </Grid>

                    {/* Details Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
                            {/* Price */}
                            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                                {formatPrice(listing.price, listing.currency)}
                            </Typography>

                            {/* Title */}
                            <Typography variant="h6" gutterBottom>
                                {listing.title}
                            </Typography>

                            {/* Location */}
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <LocationOn color="action" />
                                <Typography color="text.secondary">
                                    {listing.location.address || listing.location.neighborhood}, {listing.location.city}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Details */}
                            <Grid container spacing={2} mb={2}>
                                {listing.details.rooms && (
                                    <Grid item xs={6}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Bed color="action" />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Camere
                                                </Typography>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {listing.details.rooms}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                                {listing.details.bathrooms && (
                                    <Grid item xs={6}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Bathtub color="action" />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Băi
                                                </Typography>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {listing.details.bathrooms}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                                {listing.details.area && (
                                    <Grid item xs={6}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <SquareFoot color="action" />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Suprafață
                                                </Typography>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {listing.details.area} m²
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                                {listing.details.floor !== undefined && (
                                    <Grid item xs={6}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Etaj
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {listing.details.floor}
                                                {listing.details.totalFloors && ` / ${listing.details.totalFloors}`}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            {/* Tags */}
                            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                                <Chip label={listing.propertyType} color="primary" />
                                <Chip label={listing.transactionType} />
                                <Chip label={listing.sourcePlatform} variant="outlined" />
                            </Box>

                            {/* Actions */}
                            <Box display="flex" gap={1} mb={2}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={listing.isSaved ? <Favorite /> : <FavoriteBorder />}
                                    onClick={handleSaveToggle}
                                    color={listing.isSaved ? 'error' : 'primary'}
                                >
                                    {listing.isSaved ? 'Salvat' : 'Salvează'}
                                </Button>
                                <IconButton
                                    href={listing.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <OpenInNew />
                                </IconButton>
                            </Box>

                            {/* Published Date */}
                            <Box display="flex" alignItems="center" gap={1}>
                                <CalendarToday fontSize="small" color="action" />
                                <Typography variant="caption" color="text.secondary">
                                    Publicat: {formatDate(listing.publishedAt)}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Descriere
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                {listing.description || 'Nu există descriere disponibilă.'}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    IconButton,
    Chip,
    Box,
    Button,
} from '@mui/material';
import {
    Favorite,
    FavoriteBorder,
    LocationOn,
    Bed,
    Bathtub,
    SquareFoot,
} from '@mui/icons-material';
import type { Listing } from '../../services/listingService';

interface PropertyCardProps {
    listing: Listing;
    onSaveToggle?: (listingId: string, isSaved: boolean) => void;
}

export function PropertyCard({ listing, onSaveToggle }: PropertyCardProps) {
    const navigate = useNavigate();

    const handleSaveToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSaveToggle) {
            onSaveToggle(listing.id, !listing.isSaved);
        }
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: currency || 'EUR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                },
            }}
            onClick={() => navigate(`/listing/${listing.id}`)}
        >
            {/* Image */}
            <CardMedia
                component="img"
                height="200"
                image={listing.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                alt={listing.title}
                sx={{ objectFit: 'cover' }}
            />

            {/* Content */}
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Price */}
                <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                    {formatPrice(listing.price, listing.currency)}
                </Typography>

                {/* Title */}
                <Typography
                    variant="body1"
                    fontWeight={600}
                    gutterBottom
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {listing.title}
                </Typography>

                {/* Location */}
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                        {listing.location.neighborhood
                            ? `${listing.location.neighborhood}, ${listing.location.city}`
                            : listing.location.city}
                    </Typography>
                </Box>

                {/* Details */}
                <Box display="flex" gap={2} flexWrap="wrap" mb={1}>
                    {listing.details.rooms && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Bed fontSize="small" color="action" />
                            <Typography variant="body2">{listing.details.rooms}</Typography>
                        </Box>
                    )}
                    {listing.details.bathrooms && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Bathtub fontSize="small" color="action" />
                            <Typography variant="body2">{listing.details.bathrooms}</Typography>
                        </Box>
                    )}
                    {listing.details.area && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <SquareFoot fontSize="small" color="action" />
                            <Typography variant="body2">{listing.details.area} m²</Typography>
                        </Box>
                    )}
                </Box>

                {/* Tags */}
                <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip label={listing.propertyType} size="small" />
                    <Chip label={listing.sourcePlatform} size="small" variant="outlined" />
                </Box>
            </CardContent>

            {/* Actions */}
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button size="small" onClick={(e) => { e.stopPropagation(); navigate(`/listing/${listing.id}`); }}>
                    Detalii
                </Button>
                <IconButton
                    onClick={handleSaveToggle}
                    color={listing.isSaved ? 'error' : 'default'}
                    size="small"
                >
                    {listing.isSaved ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
            </CardActions>
        </Card>
    );
}

import {
    Box,
    Paper,
    TextField,
    MenuItem,
    Button,
    Grid,
    Slider,
    Typography,
    Collapse,
    IconButton,
    Autocomplete,
    Chip,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    SelectChangeEvent,
} from '@mui/material';
import { Search as SearchIcon, FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useState } from 'react';
import type { SearchFilters } from '../../services/listingService';

interface SearchFiltersProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    onSearch: () => void;
}

const propertyTypes = [
    { value: 'apartment', label: 'Apartament' },
    { value: 'house', label: 'Casă' },
    { value: 'land', label: 'Teren' },
    { value: 'commercial', label: 'Spațiu Comercial' },
    { value: 'office', label: 'Birou' },
    { value: 'garage', label: 'Garaj' },
];

const transactionTypes = [
    { value: 'sale', label: 'Vânzare' },
    { value: 'rent', label: 'Închiriere' },
];

const cities = [
    'București',
    'Cluj-Napoca',
    'Timișoara',
    'Iași',
    'Constanța',
    'Craiova',
    'Brașov',
    'Galați',
    'Ploiești',
    'Oradea',
    'Sibiu',
    'Arad',
    'Pitești',
    'Bacău',
    'Târgu Mureș',
];

// Neighborhoods for major cities
const neighborhoodsByCity: Record<string, string[]> = {
    'București': [
        'Centru Vechi',
        'Aviatorilor',
        'Primăverii',
        'Dorobanți',
        'Floreasca',
        'Pipera',
        'Băneasa',
        'Militari',
        'Drumul Taberei',
        'Titan',
        'Pantelimon',
        'Colentina',
        'Vitan',
        'Berceni',
    ],
    'Cluj-Napoca': [
        'Centru',
        'Mănăștur',
        'Zorilor',
        'Gheorgheni',
        'Grigorescu',
        'Andrei Mureșanu',
        'Bună Ziua',
        'Sopor',
    ],
    'Timișoara': [
        'Centru',
        'Fabric',
        'Elisabetin',
        'Iosefin',
        'Circumvalațiunii',
        'Dâmbovița',
    ],
};

const amenities = [
    'Parcare',
    'Balcon',
    'Terasă',
    'Lift',
    'Aer condiționat',
    'Centrală termică',
    'Mobilat',
    'Utilat',
    'Boxă',
    'Grădină',
    'Piscină',
    'Interfon',
    'Alarmă',
];

export function SearchFiltersComponent({ filters, onFiltersChange, onSearch }: SearchFiltersProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [priceRange, setPriceRange] = useState<number[]>([
        filters.priceMin || 0,
        filters.priceMax || 500000,
    ]);

    const selectedCity = filters.city || '';
    const availableNeighborhoods = selectedCity ? neighborhoodsByCity[selectedCity] || [] : [];

    const handleChange = (field: keyof SearchFilters, value: any) => {
        // Clear neighborhood if city changes
        if (field === 'city' && value !== filters.city) {
            onFiltersChange({ ...filters, [field]: value, neighborhood: undefined });
        } else {
            onFiltersChange({ ...filters, [field]: value });
        }
    };

    const handlePriceChange = (_: Event, newValue: number | number[]) => {
        const range = newValue as number[];
        setPriceRange(range);
        onFiltersChange({
            ...filters,
            priceMin: range[0] === 0 ? undefined : range[0],
            priceMax: range[1] === 500000 ? undefined : range[1],
        });
    };

    const handleAmenitiesChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        onFiltersChange({
            ...filters,
            amenities: typeof value === 'string' ? value.split(',') : value,
        });
    };

    const handleReset = () => {
        onFiltersChange({});
        setPriceRange([0, 500000]);
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
                {/* Property Type */}
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Tip Proprietate"
                        value={filters.propertyType || ''}
                        onChange={(e) => handleChange('propertyType', e.target.value)}
                    >
                        <MenuItem value="">Toate</MenuItem>
                        {propertyTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Transaction Type */}
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Tranzacție"
                        value={filters.transactionType || ''}
                        onChange={(e) => handleChange('transactionType', e.target.value)}
                    >
                        <MenuItem value="">Toate</MenuItem>
                        {transactionTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* City */}
                <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                        options={cities}
                        value={filters.city || null}
                        onChange={(_, newValue) => handleChange('city', newValue || undefined)}
                        renderInput={(params) => <TextField {...params} label="Oraș" />}
                    />
                </Grid>

                {/* Search Button */}
                <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<SearchIcon />}
                            onClick={onSearch}
                        >
                            Caută
                        </Button>
                        <IconButton
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            color={showAdvanced ? 'primary' : 'default'}
                        >
                            {showAdvanced ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Box>
                </Grid>

                {/* Advanced Filters */}
                <Grid item xs={12}>
                    <Collapse in={showAdvanced}>
                        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                Filtre Avansate
                            </Typography>
                            <Grid container spacing={2}>
                                {/* Neighborhood */}
                                {availableNeighborhoods.length > 0 && (
                                    <Grid item xs={12} md={4}>
                                        <Autocomplete
                                            options={availableNeighborhoods}
                                            value={filters.neighborhood || null}
                                            onChange={(_, newValue) =>
                                                handleChange('neighborhood', newValue || undefined)
                                            }
                                            renderInput={(params) => (
                                                <TextField {...params} label="Cartier" />
                                            )}
                                        />
                                    </Grid>
                                )}

                                {/* Price Range */}
                                <Grid item xs={12} md={availableNeighborhoods.length > 0 ? 8 : 12}>
                                    <Typography gutterBottom variant="body2">
                                        Preț: {priceRange[0].toLocaleString()} -{' '}
                                        {priceRange[1].toLocaleString()} EUR
                                    </Typography>
                                    <Slider
                                        value={priceRange}
                                        onChange={handlePriceChange}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={500000}
                                        step={5000}
                                        valueLabelFormat={(value) => `${value.toLocaleString()} €`}
                                    />
                                </Grid>

                                {/* Rooms */}
                                <Grid item xs={6} sm={4} md={2}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Camere"
                                        value={filters.rooms || ''}
                                        onChange={(e) =>
                                            handleChange('rooms', e.target.value ? parseInt(e.target.value) : undefined)
                                        }
                                    >
                                        <MenuItem value="">Orice</MenuItem>
                                        <MenuItem value="1">1</MenuItem>
                                        <MenuItem value="2">2</MenuItem>
                                        <MenuItem value="3">3</MenuItem>
                                        <MenuItem value="4">4</MenuItem>
                                        <MenuItem value="5">5+</MenuItem>
                                    </TextField>
                                </Grid>

                                {/* Bathrooms */}
                                <Grid item xs={6} sm={4} md={2}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Băi"
                                        value={filters.bathrooms || ''}
                                        onChange={(e) =>
                                            handleChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)
                                        }
                                    >
                                        <MenuItem value="">Orice</MenuItem>
                                        <MenuItem value="1">1</MenuItem>
                                        <MenuItem value="2">2</MenuItem>
                                        <MenuItem value="3">3+</MenuItem>
                                    </TextField>
                                </Grid>

                                {/* Area Min */}
                                <Grid item xs={6} sm={4} md={2}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Suprafață min (m²)"
                                        value={filters.areaMin || ''}
                                        onChange={(e) =>
                                            handleChange('areaMin', e.target.value ? parseInt(e.target.value) : undefined)
                                        }
                                        inputProps={{ min: 0 }}
                                    />
                                </Grid>

                                {/* Area Max */}
                                <Grid item xs={6} sm={4} md={2}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Suprafață max (m²)"
                                        value={filters.areaMax || ''}
                                        onChange={(e) =>
                                            handleChange('areaMax', e.target.value ? parseInt(e.target.value) : undefined)
                                        }
                                        inputProps={{ min: 0 }}
                                    />
                                </Grid>

                                {/* Floor */}
                                <Grid item xs={6} sm={4} md={2}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Etaj"
                                        value={filters.floor || ''}
                                        onChange={(e) =>
                                            handleChange('floor', e.target.value ? parseInt(e.target.value) : undefined)
                                        }
                                        inputProps={{ min: 0 }}
                                    />
                                </Grid>

                                {/* Year Built */}
                                <Grid item xs={6} sm={4} md={2}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="An construcție (min)"
                                        value={filters.yearBuilt || ''}
                                        onChange={(e) =>
                                            handleChange('yearBuilt', e.target.value ? parseInt(e.target.value) : undefined)
                                        }
                                        inputProps={{ min: 1900, max: new Date().getFullYear() }}
                                    />
                                </Grid>

                                {/* Amenities */}
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Facilități</InputLabel>
                                        <Select
                                            multiple
                                            value={filters.amenities || []}
                                            onChange={handleAmenitiesChange}
                                            input={<OutlinedInput label="Facilități" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => (
                                                        <Chip key={value} label={value} size="small" />
                                                    ))}
                                                </Box>
                                            )}
                                        >
                                            {amenities.map((amenity) => (
                                                <MenuItem key={amenity} value={amenity}>
                                                    {amenity}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Reset Button */}
                                <Grid item xs={12}>
                                    <Button
                                        startIcon={<Clear />}
                                        onClick={handleReset}
                                        size="small"
                                        variant="outlined"
                                    >
                                        Resetează Filtrele
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </Grid>
            </Grid>
        </Paper>
    );
}

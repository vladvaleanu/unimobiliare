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
} from '@mui/material';
import { Search as SearchIcon, FilterList, Clear } from '@mui/icons-material';
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
];

export function SearchFiltersComponent({ filters, onFiltersChange, onSearch }: SearchFiltersProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [priceRange, setPriceRange] = useState<number[]>([
        filters.priceMin || 0,
        filters.priceMax || 500000,
    ]);

    const handleChange = (field: keyof SearchFilters, value: any) => {
        onFiltersChange({ ...filters, [field]: value });
    };

    const handlePriceChange = (_: Event, newValue: number | number[]) => {
        const range = newValue as number[];
        setPriceRange(range);
        onFiltersChange({
            ...filters,
            priceMin: range[0],
            priceMax: range[1],
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
                    <TextField
                        select
                        fullWidth
                        label="Oraș"
                        value={filters.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                    >
                        <MenuItem value="">Toate</MenuItem>
                        {cities.map((city) => (
                            <MenuItem key={city} value={city}>
                                {city}
                            </MenuItem>
                        ))}
                    </TextField>
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
                        <IconButton onClick={() => setShowAdvanced(!showAdvanced)}>
                            <FilterList />
                        </IconButton>
                    </Box>
                </Grid>

                {/* Advanced Filters */}
                <Grid item xs={12}>
                    <Collapse in={showAdvanced}>
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={2}>
                                {/* Price Range */}
                                <Grid item xs={12} md={6}>
                                    <Typography gutterBottom>
                                        Preț: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} EUR
                                    </Typography>
                                    <Slider
                                        value={priceRange}
                                        onChange={handlePriceChange}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={500000}
                                        step={5000}
                                    />
                                </Grid>

                                {/* Rooms */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Camere"
                                        value={filters.rooms || ''}
                                        onChange={(e) => handleChange('rooms', parseInt(e.target.value) || undefined)}
                                        inputProps={{ min: 1, max: 10 }}
                                    />
                                </Grid>

                                {/* Area Min */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Suprafață min (m²)"
                                        value={filters.areaMin || ''}
                                        onChange={(e) => handleChange('areaMin', parseInt(e.target.value) || undefined)}
                                    />
                                </Grid>

                                {/* Area Max */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Suprafață max (m²)"
                                        value={filters.areaMax || ''}
                                        onChange={(e) => handleChange('areaMax', parseInt(e.target.value) || undefined)}
                                    />
                                </Grid>

                                {/* Reset Button */}
                                <Grid item xs={12}>
                                    <Button
                                        startIcon={<Clear />}
                                        onClick={handleReset}
                                        size="small"
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

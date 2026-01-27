/**
 * List Page Step - Step 2
 *
 * Configure list page selectors and pagination strategy
 */

import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Grid,
    Divider,
    Alert,
} from '@mui/material';
import type { ListPageConfig } from '../../pages/IntegrationBuilderPage';

interface Props {
    config: ListPageConfig;
    onChange: (config: ListPageConfig) => void;
    baseUrl: string;
}

export function ListPageStep({ config, onChange, baseUrl }: Props) {
    const handleChange = (field: keyof ListPageConfig, value: any) => {
        onChange({ ...config, [field]: value });
    };

    const handlePaginationChange = (field: keyof ListPageConfig['pagination'], value: any) => {
        onChange({
            ...config,
            pagination: { ...config.pagination, [field]: value },
        });
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                List Page Selectors
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Define the CSS selectors to extract listing items from the list page.
            </Typography>

            {!baseUrl && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Please configure the Base URL in Step 1 first.
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        label="List Container Selector"
                        value={config.listSelector}
                        onChange={(e) => handleChange('listSelector', e.target.value)}
                        fullWidth
                        required
                        placeholder="div.listings-container, ul.results"
                        helperText="CSS selector for the container that holds all listing items"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Item Selector"
                        value={config.itemSelector}
                        onChange={(e) => handleChange('itemSelector', e.target.value)}
                        fullWidth
                        required
                        placeholder="div.listing-item, li.result-item"
                        helperText="CSS selector for individual listing items within the container"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Detail Link Selector"
                        value={config.detailLinkSelector}
                        onChange={(e) => handleChange('detailLinkSelector', e.target.value)}
                        fullWidth
                        required
                        placeholder="a.listing-link, h3 > a"
                        helperText="CSS selector for the link to the listing detail page (within each item)"
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Pagination Configuration */}
            <Typography variant="h6" gutterBottom>
                Pagination
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Configure how to navigate through multiple pages of results.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Pagination Type</InputLabel>
                        <Select
                            value={config.pagination.type}
                            label="Pagination Type"
                            onChange={(e) => handlePaginationChange('type', e.target.value)}
                        >
                            <MenuItem value="page">Page Number (?page=1, 2, 3...)</MenuItem>
                            <MenuItem value="offset">Offset (?offset=0, 20, 40...)</MenuItem>
                            <MenuItem value="cursor">Cursor (next page token)</MenuItem>
                            <MenuItem value="loadMore">Load More Button (AJAX)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Parameter Name"
                        value={config.pagination.paramName}
                        onChange={(e) => handlePaginationChange('paramName', e.target.value)}
                        fullWidth
                        placeholder="page, offset, cursor"
                        helperText="URL parameter name for pagination"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Start Value"
                        type="number"
                        value={config.pagination.startValue}
                        onChange={(e) => handlePaginationChange('startValue', parseInt(e.target.value) || 1)}
                        fullWidth
                        InputProps={{ inputProps: { min: 0 } }}
                        helperText="First page value (usually 1 or 0)"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Increment"
                        type="number"
                        value={config.pagination.increment}
                        onChange={(e) => handlePaginationChange('increment', parseInt(e.target.value) || 1)}
                        fullWidth
                        InputProps={{ inputProps: { min: 1 } }}
                        helperText="Increase per page (1 for pages, 20 for offset)"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Max Pages"
                        type="number"
                        value={config.pagination.maxPages}
                        onChange={(e) => handlePaginationChange('maxPages', parseInt(e.target.value) || 10)}
                        fullWidth
                        InputProps={{ inputProps: { min: 1, max: 100 } }}
                        helperText="Maximum pages to scrape per run"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Has Next Page Selector (Optional)"
                        value={config.pagination.hasNextSelector || ''}
                        onChange={(e) => handlePaginationChange('hasNextSelector', e.target.value)}
                        fullWidth
                        placeholder="a.next-page, button.load-more"
                        helperText="CSS selector to check if more pages exist (element presence = has next)"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

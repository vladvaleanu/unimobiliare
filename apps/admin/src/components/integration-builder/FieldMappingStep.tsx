/**
 * Field Mapping Step - Step 3
 *
 * Map CSS/XPath selectors to standard listing fields
 */

import { useState } from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import type { FieldMapping, TransformConfig } from '../../pages/IntegrationBuilderPage';

interface Props {
    mappings: FieldMapping[];
    onChange: (mappings: FieldMapping[]) => void;
}

// Standard fields that can be mapped
const STANDARD_FIELDS = [
    { name: 'title', label: 'Title', required: true },
    { name: 'price', label: 'Price', required: true },
    { name: 'currency', label: 'Currency', required: false },
    { name: 'description', label: 'Description', required: false },
    { name: 'areaSqm', label: 'Area (sqm)', required: false },
    { name: 'rooms', label: 'Rooms', required: false },
    { name: 'floor', label: 'Floor', required: false },
    { name: 'totalFloors', label: 'Total Floors', required: false },
    { name: 'yearBuilt', label: 'Year Built', required: false },
    { name: 'location.city', label: 'City', required: true },
    { name: 'location.neighborhood', label: 'Neighborhood', required: false },
    { name: 'location.street', label: 'Street', required: false },
    { name: 'images', label: 'Images (array)', required: false },
    { name: 'externalId', label: 'External ID', required: true },
    { name: 'transactionType', label: 'Transaction Type', required: false },
    { name: 'propertyType', label: 'Property Type', required: false },
];

const EMPTY_MAPPING: FieldMapping = {
    field: '',
    selector: '',
    selectorType: 'css',
    attribute: '',
    transforms: [],
};

export function FieldMappingStep({ mappings, onChange }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [currentMapping, setCurrentMapping] = useState<FieldMapping>(EMPTY_MAPPING);

    const handleOpenAdd = () => {
        setEditingIndex(null);
        setCurrentMapping(EMPTY_MAPPING);
        setDialogOpen(true);
    };

    const handleOpenEdit = (index: number) => {
        setEditingIndex(index);
        setCurrentMapping({ ...mappings[index] });
        setDialogOpen(true);
    };

    const handleSave = () => {
        if (editingIndex !== null) {
            const updated = [...mappings];
            updated[editingIndex] = currentMapping;
            onChange(updated);
        } else {
            onChange([...mappings, currentMapping]);
        }
        setDialogOpen(false);
    };

    const handleDelete = (index: number) => {
        onChange(mappings.filter((_, i) => i !== index));
    };

    const getFieldLabel = (fieldName: string) => {
        return STANDARD_FIELDS.find(f => f.name === fieldName)?.label || fieldName;
    };

    const availableFields = STANDARD_FIELDS.filter(
        f => !mappings.some(m => m.field === f.name)
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Field Mappings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Map CSS selectors to standard listing fields. Required fields: Title, Price, City, External ID.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    disabled={availableFields.length === 0}
                >
                    Add Mapping
                </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell>Selector</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Attribute</TableCell>
                            <TableCell>Transforms</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mappings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No field mappings yet. Click "Add Mapping" to start.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            mappings.map((mapping, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>
                                        <Typography fontWeight={500}>
                                            {getFieldLabel(mapping.field)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                                        >
                                            {mapping.selector || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={mapping.selectorType.toUpperCase()}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {mapping.attribute || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {mapping.transforms.length > 0 ? (
                                            <Chip
                                                label={`${mapping.transforms.length} transforms`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleOpenEdit(index)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(index)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingIndex !== null ? 'Edit Field Mapping' : 'Add Field Mapping'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Field</InputLabel>
                                <Select
                                    value={currentMapping.field}
                                    label="Field"
                                    onChange={(e) => setCurrentMapping({ ...currentMapping, field: e.target.value })}
                                    disabled={editingIndex !== null}
                                >
                                    {(editingIndex !== null ? STANDARD_FIELDS : availableFields).map((field) => (
                                        <MenuItem key={field.name} value={field.name}>
                                            {field.label} {field.required && '*'}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Selector"
                                value={currentMapping.selector}
                                onChange={(e) => setCurrentMapping({ ...currentMapping, selector: e.target.value })}
                                fullWidth
                                required
                                placeholder="div.price, span.title, img.photo"
                                helperText="CSS or XPath selector to extract the value"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Selector Type</InputLabel>
                                <Select
                                    value={currentMapping.selectorType}
                                    label="Selector Type"
                                    onChange={(e) => setCurrentMapping({ ...currentMapping, selectorType: e.target.value as 'css' | 'xpath' })}
                                >
                                    <MenuItem value="css">CSS</MenuItem>
                                    <MenuItem value="xpath">XPath</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Attribute (Optional)"
                                value={currentMapping.attribute || ''}
                                onChange={(e) => setCurrentMapping({ ...currentMapping, attribute: e.target.value })}
                                fullWidth
                                placeholder="href, src, data-id"
                                helperText="Extract attribute instead of text content"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!currentMapping.field || !currentMapping.selector}
                    >
                        {editingIndex !== null ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

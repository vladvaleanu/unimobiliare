/**
 * Transform Step - Step 4
 *
 * Configure data transformations and cleaning rules
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
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import type { TransformConfig, FieldMapping } from '../../pages/IntegrationBuilderPage';

interface Props {
    transforms: TransformConfig[];
    onChange: (transforms: TransformConfig[]) => void;
    fieldMappings: FieldMapping[];
}

const TRANSFORM_TYPES = [
    { type: 'regex', label: 'Regex Extract', description: 'Extract value using regex pattern' },
    { type: 'replace', label: 'Replace Text', description: 'Replace text with another value' },
    { type: 'trim', label: 'Trim Whitespace', description: 'Remove leading/trailing whitespace' },
    { type: 'parseNumber', label: 'Parse Number', description: 'Convert text to number' },
    { type: 'parseDate', label: 'Parse Date', description: 'Convert text to date' },
    { type: 'split', label: 'Split & Take', description: 'Split by delimiter and take index' },
    { type: 'lowercase', label: 'Lowercase', description: 'Convert to lowercase' },
    { type: 'uppercase', label: 'Uppercase', description: 'Convert to uppercase' },
    { type: 'default', label: 'Default Value', description: 'Use value if empty' },
    { type: 'concat', label: 'Concatenate', description: 'Join with prefix/suffix' },
    { type: 'map', label: 'Value Map', description: 'Map values (e.g., apartament → apartment)' },
];

const EMPTY_TRANSFORM: TransformConfig = {
    type: 'trim',
    params: {},
};

export function TransformStep({ transforms, onChange, fieldMappings }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [currentTransform, setCurrentTransform] = useState<TransformConfig>(EMPTY_TRANSFORM);
    const [selectedField, setSelectedField] = useState<string>('');

    const handleOpenAdd = () => {
        setEditingIndex(null);
        setCurrentTransform(EMPTY_TRANSFORM);
        setDialogOpen(true);
    };

    const handleOpenEdit = (index: number) => {
        setEditingIndex(index);
        setCurrentTransform({ ...transforms[index] });
        setDialogOpen(true);
    };

    const handleSave = () => {
        if (editingIndex !== null) {
            const updated = [...transforms];
            updated[editingIndex] = currentTransform;
            onChange(updated);
        } else {
            onChange([...transforms, currentTransform]);
        }
        setDialogOpen(false);
    };

    const handleDelete = (index: number) => {
        onChange(transforms.filter((_, i) => i !== index));
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= transforms.length) return;

        const updated = [...transforms];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        onChange(updated);
    };

    const getTransformLabel = (type: string) => {
        return TRANSFORM_TYPES.find(t => t.type === type)?.label || type;
    };

    const renderParamInputs = () => {
        const { type } = currentTransform;

        switch (type) {
            case 'regex':
                return (
                    <>
                        <Grid item xs={12}>
                            <TextField
                                label="Pattern"
                                value={currentTransform.params.pattern || ''}
                                onChange={(e) => setCurrentTransform({
                                    ...currentTransform,
                                    params: { ...currentTransform.params, pattern: e.target.value }
                                })}
                                fullWidth
                                placeholder="(\d+)"
                                helperText="Regex pattern with capture group"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Group Index"
                                type="number"
                                value={currentTransform.params.group || 1}
                                onChange={(e) => setCurrentTransform({
                                    ...currentTransform,
                                    params: { ...currentTransform.params, group: parseInt(e.target.value) || 1 }
                                })}
                                fullWidth
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                        </Grid>
                    </>
                );

            case 'replace':
                return (
                    <>
                        <Grid item xs={12}>
                            <TextField
                                label="Find"
                                value={currentTransform.params.find || ''}
                                onChange={(e) => setCurrentTransform({
                                    ...currentTransform,
                                    params: { ...currentTransform.params, find: e.target.value }
                                })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Replace With"
                                value={currentTransform.params.replace || ''}
                                onChange={(e) => setCurrentTransform({
                                    ...currentTransform,
                                    params: { ...currentTransform.params, replace: e.target.value }
                                })}
                                fullWidth
                            />
                        </Grid>
                    </>
                );

            case 'split':
                return (
                    <>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Delimiter"
                                value={currentTransform.params.delimiter || ''}
                                onChange={(e) => setCurrentTransform({
                                    ...currentTransform,
                                    params: { ...currentTransform.params, delimiter: e.target.value }
                                })}
                                fullWidth
                                placeholder=", or |"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Take Index"
                                type="number"
                                value={currentTransform.params.index || 0}
                                onChange={(e) => setCurrentTransform({
                                    ...currentTransform,
                                    params: { ...currentTransform.params, index: parseInt(e.target.value) || 0 }
                                })}
                                fullWidth
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                        </Grid>
                    </>
                );

            case 'parseDate':
                return (
                    <Grid item xs={12}>
                        <TextField
                            label="Input Format"
                            value={currentTransform.params.format || ''}
                            onChange={(e) => setCurrentTransform({
                                ...currentTransform,
                                params: { ...currentTransform.params, format: e.target.value }
                            })}
                            fullWidth
                            placeholder="DD.MM.YYYY"
                            helperText="Date format (e.g., DD.MM.YYYY, YYYY-MM-DD)"
                        />
                    </Grid>
                );

            case 'default':
                return (
                    <Grid item xs={12}>
                        <TextField
                            label="Default Value"
                            value={currentTransform.params.value || ''}
                            onChange={(e) => setCurrentTransform({
                                ...currentTransform,
                                params: { ...currentTransform.params, value: e.target.value }
                            })}
                            fullWidth
                            helperText="Value to use if extracted value is empty"
                        />
                    </Grid>
                );

            case 'concat':
                return (
                    <>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Prefix"
                                value={currentTransform.params.prefix || ''}
                                onChange={(e) => setCurrentTransform({
                                    ...currentTransform,
                                    params: { ...currentTransform.params, prefix: e.target.value }
                                })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Suffix"
                                value={currentTransform.params.suffix || ''}
                                onChange={(e) => setCurrentTransform({
                                    ...currentTransform,
                                    params: { ...currentTransform.params, suffix: e.target.value }
                                })}
                                fullWidth
                            />
                        </Grid>
                    </>
                );

            case 'map':
                return (
                    <Grid item xs={12}>
                        <TextField
                            label="Value Mappings"
                            value={currentTransform.params.mappings || ''}
                            onChange={(e) => setCurrentTransform({
                                ...currentTransform,
                                params: { ...currentTransform.params, mappings: e.target.value }
                            })}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="apartament=apartment&#10;casa=house&#10;teren=land"
                            helperText="One mapping per line: source=target"
                        />
                    </Grid>
                );

            default:
                return null;
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Data Transforms
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Define transformations to clean and normalize extracted data. Transforms are applied in order.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                >
                    Add Transform
                </Button>
            </Box>

            {fieldMappings.length === 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Add field mappings in Step 3 first to see available fields for transformation.
                </Alert>
            )}

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell width={60}>Order</TableCell>
                            <TableCell>Transform Type</TableCell>
                            <TableCell>Parameters</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transforms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No transforms configured. Click "Add Transform" to add data cleaning rules.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            transforms.map((transform, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleMove(index, 'up')}
                                                disabled={index === 0}
                                            >
                                                <ArrowUpIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleMove(index, 'down')}
                                                disabled={index === transforms.length - 1}
                                            >
                                                <ArrowDownIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getTransformLabel(transform.type)}
                                            size="small"
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                            {JSON.stringify(transform.params)}
                                        </Typography>
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
                    {editingIndex !== null ? 'Edit Transform' : 'Add Transform'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Transform Type</InputLabel>
                                <Select
                                    value={currentTransform.type}
                                    label="Transform Type"
                                    onChange={(e) => setCurrentTransform({
                                        type: e.target.value as TransformConfig['type'],
                                        params: {},
                                    })}
                                >
                                    {TRANSFORM_TYPES.map((t) => (
                                        <MenuItem key={t.type} value={t.type}>
                                            {t.label} - {t.description}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {renderParamInputs()}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>
                        {editingIndex !== null ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

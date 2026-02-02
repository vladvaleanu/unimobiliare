/**
 * Test Step - Step 5
 *
 * Live testing of the integration configuration
 */

import { useState } from 'react';
import {
    Box,
    TextField,
    Typography,
    Grid,
    Button,
    Paper,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Code as CodeIcon,
} from '@mui/icons-material';
import type {
    SourceConfig,
    ListPageConfig,
    FieldMapping,
    TransformConfig,
} from '../../pages/IntegrationBuilderPage';

interface Props {
    sourceConfig: SourceConfig;
    listPageConfig: ListPageConfig;
    fieldMappings: FieldMapping[];
    transforms: TransformConfig[];
}

interface TestResult {
    success: boolean;
    message: string;
    itemsFound: number;
    sampleData: Record<string, any>[];
    rawHtml?: string;
    errors: string[];
    duration: number;
}

export function TestStep({
    sourceConfig,
    listPageConfig,
    fieldMappings,
    transforms,
}: Props) {
    const [testUrl, setTestUrl] = useState(sourceConfig.baseUrl);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);

    const handleTest = async () => {
        setLoading(true);
        setResult(null);

        try {
            const startTime = Date.now();

            // Convert fieldMappings to the format expected by the API
            const apiMappings = fieldMappings.map(m => ({
                field: m.field,
                selector: m.selector,
                attribute: m.attribute || 'text',
                multiple: m.field === 'images',
                transforms: m.transforms?.map(t => ({
                    type: t.type,
                    options: t.params
                }))
            }));

            const response = await fetch('/api/v1/integrations/builder/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    url: testUrl,
                    fieldMappings: apiMappings
                })
            });

            const data = await response.json();
            const duration = Date.now() - startTime;

            if (data.success && data.data) {
                const preview = data.data;
                const sampleItem: Record<string, any> = {};

                preview.extractions?.forEach((ext: any) => {
                    sampleItem[ext.field] = ext.value;
                });

                setResult({
                    success: preview.success,
                    message: preview.success ? 'Test completed successfully' : (preview.error || 'Test failed'),
                    itemsFound: 1,
                    sampleData: Object.keys(sampleItem).length > 0 ? [sampleItem] : [],
                    rawHtml: undefined,
                    errors: preview.extractions?.filter((e: any) => e.error).map((e: any) => `${e.field}: ${e.error}`) || [],
                    duration,
                });
            } else {
                setResult({
                    success: false,
                    message: data.error?.message || 'Failed to run test',
                    itemsFound: 0,
                    sampleData: [],
                    errors: [data.error?.message || 'Unknown error'],
                    duration: Date.now() - startTime,
                });
            }
        } catch (error: any) {
            setResult({
                success: false,
                message: error.message || 'Network error',
                itemsFound: 0,
                sampleData: [],
                errors: [error.message || 'Network error'],
                duration: 0,
            });
        }

        setLoading(false);
    };

    const getValidationStatus = () => {
        const issues: string[] = [];

        if (!sourceConfig.name) issues.push('Source name is required');
        if (!sourceConfig.baseUrl) issues.push('Base URL is required');
        if (!listPageConfig.listSelector) issues.push('List selector is required');
        if (!listPageConfig.itemSelector) issues.push('Item selector is required');

        const requiredFields = ['title', 'price', 'location.city', 'externalId'];
        const mappedFields = fieldMappings.map((m) => m.field);
        const missingRequired = requiredFields.filter((f) => !mappedFields.includes(f));

        if (missingRequired.length > 0) {
            issues.push(`Missing required field mappings: ${missingRequired.join(', ')}`);
        }

        return issues;
    };

    const validationIssues = getValidationStatus();

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Test Integration
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Test your configuration by fetching data from a sample URL.
            </Typography>

            {/* Validation Status */}
            {validationIssues.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Configuration Issues:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {validationIssues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                        ))}
                    </ul>
                </Alert>
            )}

            {/* Test Controls */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <TextField
                            label="Test URL"
                            value={testUrl}
                            onChange={(e) => setTestUrl(e.target.value)}
                            fullWidth
                            placeholder={sourceConfig.baseUrl || 'https://example.com/listings'}
                            helperText="Enter a URL to test the scraping configuration"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
                            onClick={handleTest}
                            disabled={loading || !testUrl}
                            fullWidth
                            sx={{ height: 56 }}
                        >
                            {loading ? 'Testing...' : 'Run Test'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Configuration Summary */}
            <Accordion defaultExpanded={false} sx={{ mb: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CodeIcon fontSize="small" />
                        <Typography>Configuration Preview</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box
                        component="pre"
                        sx={{
                            bgcolor: 'grey.900',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.75rem',
                            maxHeight: 300,
                        }}
                    >
                        {JSON.stringify(
                            {
                                source: sourceConfig,
                                listPage: listPageConfig,
                                fieldMappings,
                                transforms,
                            },
                            null,
                            2
                        )}
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Test Results */}
            {result && (
                <Box>
                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        {result.success ? (
                            <SuccessIcon color="success" fontSize="large" />
                        ) : (
                            <ErrorIcon color="error" fontSize="large" />
                        )}
                        <Box>
                            <Typography variant="h6">
                                {result.success ? 'Test Successful' : 'Test Failed'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Found {result.itemsFound} items in {result.duration}ms
                            </Typography>
                        </Box>
                    </Box>

                    {result.errors.length > 0 && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Errors:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {result.errors.map((error, i) => (
                                    <li key={i}>{error}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}

                    {/* Sample Data Table */}
                    {result.sampleData.length > 0 && (
                        <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                                Sample Extracted Data ({result.sampleData.length} items)
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {Object.keys(result.sampleData[0]).map((key) => (
                                                <TableCell key={key}>
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {key}
                                                    </Typography>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {result.sampleData.map((item, index) => (
                                            <TableRow key={index} hover>
                                                {Object.values(item).map((value, i) => (
                                                    <TableCell key={i}>
                                                        {typeof value === 'number' ? (
                                                            <Chip label={value} size="small" variant="outlined" />
                                                        ) : (
                                                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                                {String(value)}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* Raw HTML Preview */}
                    {result.rawHtml && (
                        <Accordion sx={{ mt: 3 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Raw HTML Sample</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box
                                    component="pre"
                                    sx={{
                                        bgcolor: 'grey.900',
                                        p: 2,
                                        borderRadius: 1,
                                        overflow: 'auto',
                                        fontSize: '0.75rem',
                                        maxHeight: 200,
                                    }}
                                >
                                    {result.rawHtml}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    )}
                </Box>
            )}
        </Box>
    );
}

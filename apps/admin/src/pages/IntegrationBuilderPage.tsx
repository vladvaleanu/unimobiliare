/**
 * Integration Builder Page
 *
 * No-Code/Low-Code visual adapter creator for integrating real estate platforms.
 * 5-step wizard: Source → List Page → Fields → Transform → Test
 */

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { SourceConfigStep } from '../components/integration-builder/SourceConfigStep';
import { ListPageStep } from '../components/integration-builder/ListPageStep';
import { FieldMappingStep } from '../components/integration-builder/FieldMappingStep';
import { TransformStep } from '../components/integration-builder/TransformStep';
import { TestStep } from '../components/integration-builder/TestStep';
import { integrationsService } from '../services/integrationsService';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SourceConfig {
    name: string;
    displayName: string;
    baseUrl: string;
    type: 'html' | 'api';
    authType: 'none' | 'basic' | 'bearer' | 'cookie';
    authCredentials: Record<string, string>;
    rateLimit: {
        requestsPerMinute: number;
        delayMs: number;
    };
    headers: Record<string, string>;
}

export interface ListPageConfig {
    listSelector: string;
    itemSelector: string;
    detailLinkSelector: string;
    pagination: {
        type: 'page' | 'offset' | 'cursor' | 'loadMore';
        paramName: string;
        startValue: number;
        increment: number;
        maxPages: number;
        hasNextSelector?: string;
    };
}

export interface FieldMapping {
    field: string;
    selector: string;
    selectorType: 'css' | 'xpath';
    attribute?: string;
    transforms: TransformConfig[];
}

export interface TransformConfig {
    type: 'trim' | 'regex' | 'replace' | 'parseNumber' | 'parseDate' | 'split' | 'lowercase' | 'uppercase' | 'default' | 'concat' | 'map';
    params: Record<string, unknown>;
}

export interface IntegrationConfig {
    source: SourceConfig;
    listPage: ListPageConfig;
    fieldMappings: FieldMapping[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
    { label: 'Source Config', description: 'URL, authentication, rate limits' },
    { label: 'List Page', description: 'Container and pagination selectors' },
    { label: 'Field Mapping', description: 'Map selectors to fields' },
    { label: 'Transforms', description: 'Data transformation rules' },
    { label: 'Test', description: 'Live testing with real URLs' },
];

const DEFAULT_SOURCE_CONFIG: SourceConfig = {
    name: '',
    displayName: '',
    baseUrl: '',
    type: 'html',
    authType: 'none',
    authCredentials: {},
    rateLimit: {
        requestsPerMinute: 30,
        delayMs: 2000,
    },
    headers: {},
};

const DEFAULT_LIST_PAGE_CONFIG: ListPageConfig = {
    listSelector: '',
    itemSelector: '',
    detailLinkSelector: '',
    pagination: {
        type: 'page',
        paramName: 'page',
        startValue: 1,
        increment: 1,
        maxPages: 10,
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function IntegrationBuilderPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [activeStep, setActiveStep] = useState(0);
    const [sourceConfig, setSourceConfig] = useState<SourceConfig>(DEFAULT_SOURCE_CONFIG);
    const [listPageConfig, setListPageConfig] = useState<ListPageConfig>(DEFAULT_LIST_PAGE_CONFIG);
    const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
    const [transforms, setTransforms] = useState<TransformConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch existing integration data when editing
    useEffect(() => {
        if (!id) return;

        const fetchIntegration = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await integrationsService.getById(id);
                const integration = response.data;

                // Populate source config
                if (integration.sourceConfig) {
                    const src = integration.sourceConfig as Record<string, unknown>;
                    setSourceConfig({
                        name: integration.name || '',
                        displayName: integration.displayName || '',
                        baseUrl: (src.baseUrl as string) || '',
                        type: (src.type as 'html' | 'api') || 'html',
                        authType: (src.authType as 'none' | 'basic' | 'bearer' | 'cookie') || 'none',
                        authCredentials: (src.authCredentials as Record<string, string>) || {},
                        rateLimit: (src.rateLimit as { requestsPerMinute: number; delayMs: number }) || {
                            requestsPerMinute: 30,
                            delayMs: 2000,
                        },
                        headers: (src.headers as Record<string, string>) || {},
                    });
                }

                // Populate list page config
                if (integration.listPageConfig) {
                    const lp = integration.listPageConfig as Record<string, unknown>;
                    setListPageConfig({
                        listSelector: (lp.listSelector as string) || '',
                        itemSelector: (lp.itemSelector as string) || '',
                        detailLinkSelector: (lp.detailLinkSelector as string) || '',
                        pagination: (lp.pagination as ListPageConfig['pagination']) || {
                            type: 'page',
                            paramName: 'page',
                            startValue: 1,
                            increment: 1,
                            maxPages: 10,
                        },
                    });
                }

                // Populate field mappings
                if (integration.fieldMappings && Array.isArray(integration.fieldMappings)) {
                    setFieldMappings(integration.fieldMappings.map((fm) => {
                        const mapping: FieldMapping = {
                            field: (fm.field as string) || '',
                            selector: (fm.selector as string) || '',
                            selectorType: (fm.selectorType as 'css' | 'xpath') || 'css',
                            transforms: (fm.transforms as TransformConfig[]) || [],
                        };
                        if (fm.attribute) {
                            mapping.attribute = fm.attribute as string;
                        }
                        return mapping;
                    }));
                }
            } catch (err) {
                console.error('Failed to load integration:', err);
                setError('Failed to load integration data');
            } finally {
                setLoading(false);
            }
        };

        fetchIntegration();
    }, [id]);

    const handleNext = () => {
        setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSave = async () => {
        // TODO: Call API to save integration
        const config: IntegrationConfig = {
            source: sourceConfig,
            listPage: listPageConfig,
            fieldMappings,
        };
        console.log('Saving integration:', config);
        navigate('/integrations');
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <SourceConfigStep
                        config={sourceConfig}
                        onChange={setSourceConfig}
                    />
                );
            case 1:
                return (
                    <ListPageStep
                        config={listPageConfig}
                        onChange={setListPageConfig}
                        baseUrl={sourceConfig.baseUrl}
                    />
                );
            case 2:
                return (
                    <FieldMappingStep
                        mappings={fieldMappings}
                        onChange={setFieldMappings}
                    />
                );
            case 3:
                return (
                    <TransformStep
                        transforms={transforms}
                        onChange={setTransforms}
                        fieldMappings={fieldMappings}
                    />
                );
            case 4:
                return (
                    <TestStep
                        sourceConfig={sourceConfig}
                        listPageConfig={listPageConfig}
                        fieldMappings={fieldMappings}
                        transforms={transforms}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/integrations')}
                >
                    Back
                </Button>
                <Typography variant="h4" fontWeight={700}>
                    {isEditing ? 'Edit Integration' : 'New Integration'}
                </Typography>
            </Box>

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Error State */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {STEPS.map((step) => (
                    <Step key={step.label}>
                        <StepLabel
                            optional={
                                <Typography variant="caption" color="text.secondary">
                                    {step.description}
                                </Typography>
                            }
                        >
                            {step.label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Content */}
            <Card>
                <CardContent sx={{ p: 4 }}>
                    {renderStepContent()}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                >
                    Back
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {activeStep === STEPS.length - 1 ? (
                        <Button variant="contained" onClick={handleSave}>
                            Save Integration
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={handleNext}>
                            Next
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

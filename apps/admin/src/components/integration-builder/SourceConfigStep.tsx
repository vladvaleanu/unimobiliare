/**
 * Source Config Step - Step 1
 *
 * Configure the data source: URL, type (HTML/API), authentication, rate limits
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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputAdornment,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { SourceConfig } from '../../pages/IntegrationBuilderPage';

interface Props {
    config: SourceConfig;
    onChange: (config: SourceConfig) => void;
}

export function SourceConfigStep({ config, onChange }: Props) {
    const handleChange = (field: keyof SourceConfig, value: any) => {
        onChange({ ...config, [field]: value });
    };

    const handleRateLimitChange = (field: keyof SourceConfig['rateLimit'], value: number) => {
        onChange({
            ...config,
            rateLimit: { ...config.rateLimit, [field]: value },
        });
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Basic Information
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Configure the basic details and URL for this integration.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Internal Name"
                        value={config.name}
                        onChange={(e) => handleChange('name', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        fullWidth
                        required
                        helperText="Lowercase, no spaces (e.g., imobiliare-ro)"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Display Name"
                        value={config.displayName}
                        onChange={(e) => handleChange('displayName', e.target.value)}
                        fullWidth
                        required
                        helperText="Human-readable name (e.g., Imobiliare.ro)"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Base URL"
                        value={config.baseUrl}
                        onChange={(e) => handleChange('baseUrl', e.target.value)}
                        fullWidth
                        required
                        placeholder="https://www.example.com"
                        helperText="The base URL of the platform (without trailing slash)"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Source Type</InputLabel>
                        <Select
                            value={config.type}
                            label="Source Type"
                            onChange={(e) => handleChange('type', e.target.value)}
                        >
                            <MenuItem value="html">HTML (Web Scraping)</MenuItem>
                            <MenuItem value="api">API (REST/JSON)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Authentication */}
            <Typography variant="h6" gutterBottom>
                Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Configure authentication if the platform requires login.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Auth Type</InputLabel>
                        <Select
                            value={config.authType}
                            label="Auth Type"
                            onChange={(e) => handleChange('authType', e.target.value)}
                        >
                            <MenuItem value="none">None (Public)</MenuItem>
                            <MenuItem value="basic">Basic Auth</MenuItem>
                            <MenuItem value="bearer">Bearer Token</MenuItem>
                            <MenuItem value="cookie">Cookie Session</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {config.authType === 'basic' && (
                    <>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Username"
                                value={config.authCredentials.username || ''}
                                onChange={(e) => handleChange('authCredentials', { ...config.authCredentials, username: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Password"
                                type="password"
                                value={config.authCredentials.password || ''}
                                onChange={(e) => handleChange('authCredentials', { ...config.authCredentials, password: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                    </>
                )}

                {config.authType === 'bearer' && (
                    <Grid item xs={12}>
                        <TextField
                            label="Bearer Token"
                            value={config.authCredentials.token || ''}
                            onChange={(e) => handleChange('authCredentials', { ...config.authCredentials, token: e.target.value })}
                            fullWidth
                            helperText="API token for authorization"
                        />
                    </Grid>
                )}
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Rate Limiting */}
            <Typography variant="h6" gutterBottom>
                Rate Limiting
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Configure request rate limits to avoid being blocked.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Requests per Minute"
                        type="number"
                        value={config.rateLimit.requestsPerMinute}
                        onChange={(e) => handleRateLimitChange('requestsPerMinute', parseInt(e.target.value) || 30)}
                        fullWidth
                        InputProps={{
                            inputProps: { min: 1, max: 120 },
                        }}
                        helperText="Maximum requests allowed per minute"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Delay Between Requests"
                        type="number"
                        value={config.rateLimit.delayMs}
                        onChange={(e) => handleRateLimitChange('delayMs', parseInt(e.target.value) || 1000)}
                        fullWidth
                        InputProps={{
                            inputProps: { min: 500, max: 10000 },
                            endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                        }}
                        helperText="Minimum delay between requests"
                    />
                </Grid>
            </Grid>

            {/* Advanced Settings */}
            <Accordion sx={{ mt: 4 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Advanced Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Custom headers (one per line, format: Header-Name: value)
                    </Typography>
                    <TextField
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="User-Agent: Mozilla/5.0...&#10;Accept-Language: ro-RO"
                        value={Object.entries(config.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
                        onChange={(e) => {
                            const headers: Record<string, string> = {};
                            e.target.value.split('\n').forEach((line) => {
                                const [key, ...valueParts] = line.split(':');
                                if (key && valueParts.length) {
                                    headers[key.trim()] = valueParts.join(':').trim();
                                }
                            });
                            handleChange('headers', headers);
                        }}
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

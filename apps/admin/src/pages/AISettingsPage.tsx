import { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Card,
    CardContent,
    CardHeader,
    Chip,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from '@mui/material';
import {
    Save as SaveIcon,
    Refresh as RefreshIcon,
    Check as CheckIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

interface AIModelConfig {
    name: string;
    provider: 'ollama' | 'openai' | 'anthropic';
    model: string;
    enabled: boolean;
    isDefault: boolean;
}

const defaultModels: AIModelConfig[] = [
    { name: 'Feature Extraction', provider: 'ollama', model: 'llama3:8b', enabled: true, isDefault: true },
    { name: 'Text Summarization', provider: 'ollama', model: 'llama3:8b', enabled: true, isDefault: false },
    { name: 'Deduplication', provider: 'ollama', model: 'nomic-embed-text', enabled: true, isDefault: false },
    { name: 'Fraud Detection', provider: 'openai', model: 'gpt-4', enabled: false, isDefault: false },
    { name: 'Chatbot', provider: 'openai', model: 'gpt-3.5-turbo', enabled: false, isDefault: false },
];

export function AISettingsPage() {
    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
    const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [openaiKey, setOpenaiKey] = useState('');
    const [models, setModels] = useState<AIModelConfig[]>(defaultModels);
    const [saved, setSaved] = useState(false);

    const testOllamaConnection = async () => {
        setOllamaStatus('checking');
        try {
            // In production, this would call the backend to test connection
            await new Promise(resolve => setTimeout(resolve, 1000));
            setOllamaStatus('connected');
        } catch {
            setOllamaStatus('error');
        }
    };

    const handleSave = () => {
        // In production, this would save to the API
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const toggleModel = (index: number) => {
        const updated = [...models];
        updated[index].enabled = !updated[index].enabled;
        setModels(updated);
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        AI Settings
                    </Typography>
                    <Typography color="text.secondary">
                        Configure AI providers and models
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                >
                    Save Changes
                </Button>
            </Box>

            {saved && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Settings saved successfully!
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Ollama Configuration */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            title="Ollama (Local AI)"
                            subheader="Self-hosted AI inference server"
                            action={
                                <Chip
                                    label={
                                        ollamaStatus === 'connected' ? 'Connected' :
                                            ollamaStatus === 'error' ? 'Disconnected' : 'Checking...'
                                    }
                                    color={
                                        ollamaStatus === 'connected' ? 'success' :
                                            ollamaStatus === 'error' ? 'error' : 'default'
                                    }
                                    size="small"
                                />
                            }
                        />
                        <CardContent>
                            <TextField
                                fullWidth
                                label="Ollama Server URL"
                                value={ollamaUrl}
                                onChange={(e) => setOllamaUrl(e.target.value)}
                                placeholder="http://localhost:11434"
                                sx={{ mb: 2 }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={testOllamaConnection}
                            >
                                Test Connection
                            </Button>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" gutterBottom>
                                Available Models
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                llama3:8b, mistral:7b, phi3, nomic-embed-text
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* OpenAI Configuration */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            title="OpenAI (Cloud AI)"
                            subheader="Fallback for complex tasks"
                        />
                        <CardContent>
                            <TextField
                                fullWidth
                                type="password"
                                label="OpenAI API Key"
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                                placeholder="sk-..."
                                sx={{ mb: 2 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                Leave empty to disable OpenAI fallback
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" gutterBottom>
                                Available Models
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                gpt-4, gpt-4-turbo, gpt-3.5-turbo
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Model Assignment */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Model Assignment per Task
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Configure which AI model handles each task type
                        </Typography>

                        <List>
                            {models.map((model, index) => (
                                <ListItem
                                    key={model.name}
                                    sx={{
                                        backgroundColor: model.enabled ? 'action.hover' : 'transparent',
                                        borderRadius: 1,
                                        mb: 1,
                                    }}
                                >
                                    <ListItemText
                                        primary={model.name}
                                        secondary={`${model.provider} / ${model.model}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <Chip
                                            label={model.provider}
                                            size="small"
                                            color={model.provider === 'ollama' ? 'primary' : 'secondary'}
                                            sx={{ mr: 1 }}
                                        />
                                        <Switch
                                            checked={model.enabled}
                                            onChange={() => toggleModel(index)}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

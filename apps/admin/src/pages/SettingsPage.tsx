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
    Tabs,
    Tab,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
            {value === index && children}
        </Box>
    );
}

export function SettingsPage() {
    const [tab, setTab] = useState(0);
    const [saved, setSaved] = useState(false);

    // General Settings
    const [siteName, setSiteName] = useState('Unimobiliare');
    const [siteUrl, setSiteUrl] = useState('https://unimobiliare.ro');
    const [supportEmail, setSupportEmail] = useState('support@unimobiliare.ro');

    // Feature Flags
    const [registrationEnabled, setRegistrationEnabled] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);

    // Email Settings
    const [smtpHost, setSmtpHost] = useState('smtp.example.com');
    const [smtpPort, setSmtpPort] = useState('587');
    const [smtpUser, setSmtpUser] = useState('');
    const [smtpPassword, setSmtpPassword] = useState('');

    const handleSave = () => {
        // In production, this would save to the API
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Settings
                    </Typography>
                    <Typography color="text.secondary">
                        Configure system settings and features
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

            <Paper sx={{ width: '100%' }}>
                <Tabs
                    value={tab}
                    onChange={(_, newValue) => setTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                    <Tab label="General" />
                    <Tab label="Features" />
                    <Tab label="Email" />
                    <Tab label="Backup" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {/* General Settings */}
                    <TabPanel value={tab} index={0}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Site Name"
                                    value={siteName}
                                    onChange={(e) => setSiteName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Site URL"
                                    value={siteUrl}
                                    onChange={(e) => setSiteUrl(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Support Email"
                                    value={supportEmail}
                                    onChange={(e) => setSupportEmail(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Feature Flags */}
                    <TabPanel value={tab} index={1}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={registrationEnabled}
                                                    onChange={(e) => setRegistrationEnabled(e.target.checked)}
                                                />
                                            }
                                            label="User Registration Enabled"
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            Allow new users to register accounts
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={maintenanceMode}
                                                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                                                    color="warning"
                                                />
                                            }
                                            label="Maintenance Mode"
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            Show maintenance page to all non-admin users
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={emailNotifications}
                                                    onChange={(e) => setEmailNotifications(e.target.checked)}
                                                />
                                            }
                                            label="Email Notifications"
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            Send email notifications to users
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Email Settings */}
                    <TabPanel value={tab} index={2}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="SMTP Host"
                                    value={smtpHost}
                                    onChange={(e) => setSmtpHost(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="SMTP Port"
                                    value={smtpPort}
                                    onChange={(e) => setSmtpPort(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="SMTP Username"
                                    value={smtpUser}
                                    onChange={(e) => setSmtpUser(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="SMTP Password"
                                    value={smtpPassword}
                                    onChange={(e) => setSmtpPassword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="outlined">
                                    Send Test Email
                                </Button>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Backup Settings */}
                    <TabPanel value={tab} index={3}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Card>
                                    <CardHeader
                                        title="Database Backup"
                                        subheader="Last backup: Today at 03:00 AM"
                                    />
                                    <CardContent>
                                        <Box display="flex" gap={2}>
                                            <Button variant="contained">
                                                Create Backup Now
                                            </Button>
                                            <Button variant="outlined">
                                                Restore from Backup
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                <Card>
                                    <CardHeader
                                        title="Remote Backup (Backblaze B2)"
                                        subheader="Configure cloud backup storage"
                                    />
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="B2 Application Key ID"
                                                    placeholder="Enter Key ID"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    type="password"
                                                    label="B2 Application Key"
                                                    placeholder="Enter Key"
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="B2 Bucket Name"
                                                    placeholder="unimobiliare-backups"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>
                </Box>
            </Paper>
        </Box>
    );
}

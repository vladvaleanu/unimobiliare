import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Pagination,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';

interface AuditLogEntry {
    id: string;
    timestamp: string;
    adminEmail: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW';
    resourceType: string;
    resourceId: string;
    changes: { before?: unknown; after?: unknown } | null;
    ipAddress: string;
}

// Mock data for demo
const mockAuditLogs: AuditLogEntry[] = [
    {
        id: '1',
        timestamp: new Date().toISOString(),
        adminEmail: 'admin@unimobiliare.ro',
        action: 'LOGIN',
        resourceType: 'session',
        resourceId: '-',
        changes: null,
        ipAddress: '127.0.0.1',
    },
    {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        adminEmail: 'admin@unimobiliare.ro',
        action: 'CREATE',
        resourceType: 'integration',
        resourceId: 'imobiliare-ro',
        changes: { after: { name: 'Imobiliare.ro' } },
        ipAddress: '127.0.0.1',
    },
    {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        adminEmail: 'admin@unimobiliare.ro',
        action: 'UPDATE',
        resourceType: 'plan',
        resourceId: 'pro',
        changes: { before: { price: 29 }, after: { price: 39 } },
        ipAddress: '127.0.0.1',
    },
];

const actionColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'error',
    LOGIN: 'info',
    LOGOUT: 'default',
    VIEW: 'default',
};

const actionIcons: Record<string, React.ReactNode> = {
    CREATE: <AddIcon fontSize="small" />,
    UPDATE: <EditIcon fontSize="small" />,
    DELETE: <DeleteIcon fontSize="small" />,
    VIEW: <ViewIcon fontSize="small" />,
};

export function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages] = useState(1);

    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setLogs(mockAuditLogs);
            setLoading(false);
        }, 500);
    }, [page, actionFilter]);

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('ro-RO', {
            dateStyle: 'short',
            timeStyle: 'medium',
        });
    };

    const filteredLogs = logs.filter((log) => {
        if (actionFilter !== 'all' && log.action !== actionFilter) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                log.adminEmail.toLowerCase().includes(query) ||
                log.resourceType.toLowerCase().includes(query) ||
                log.resourceId.toLowerCase().includes(query)
            );
        }
        return true;
    });

    return (
        <Box>
            {/* Header */}
            <Box mb={3}>
                <Typography variant="h4" fontWeight={700}>
                    Audit Log
                </Typography>
                <Typography color="text.secondary">
                    Track all administrative actions in the system
                </Typography>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        size="small"
                        placeholder="Search by admin, resource..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ minWidth: 300 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Action</InputLabel>
                        <Select
                            value={actionFilter}
                            label="Action"
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Actions</MenuItem>
                            <MenuItem value="CREATE">Create</MenuItem>
                            <MenuItem value="UPDATE">Update</MenuItem>
                            <MenuItem value="DELETE">Delete</MenuItem>
                            <MenuItem value="LOGIN">Login</MenuItem>
                            <MenuItem value="LOGOUT">Logout</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Logs Table */}
            <TableContainer component={Paper}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Admin</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Resource</TableCell>
                                <TableCell>IP Address</TableCell>
                                <TableCell>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography color="text.secondary" py={4}>
                                            No audit log entries found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatTimestamp(log.timestamp)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{log.adminEmail}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={actionIcons[log.action] as React.ReactElement}
                                                label={log.action}
                                                color={actionColors[log.action]}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {log.resourceType}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {log.resourceId}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontFamily="monospace">
                                                {log.ipAddress}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {log.changes ? (
                                                <Typography variant="caption" color="text.secondary">
                                                    {JSON.stringify(log.changes).substring(0, 50)}...
                                                </Typography>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                />
            </Box>
        </Box>
    );
}

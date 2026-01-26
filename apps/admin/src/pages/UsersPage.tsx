import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    IconButton,
    InputAdornment,
    TablePagination,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Block as BlockIcon,
} from '@mui/icons-material';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    subscriptionStatus: 'trial' | 'active' | 'canceled' | 'expired';
    createdAt: string;
}

// TODO: Replace with API data
const mockUsers: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@unimobiliare.ro', role: 'admin', subscriptionStatus: 'active', createdAt: '2026-01-01' },
    { id: '2', name: 'John Doe', email: 'john@example.com', role: 'user', subscriptionStatus: 'trial', createdAt: '2026-01-20' },
    { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'user', subscriptionStatus: 'active', createdAt: '2026-01-15' },
    { id: '4', name: 'Bob Wilson', email: 'bob@example.com', role: 'user', subscriptionStatus: 'canceled', createdAt: '2026-01-10' },
    { id: '5', name: 'Alice Brown', email: 'alice@example.com', role: 'user', subscriptionStatus: 'expired', createdAt: '2025-12-01' },
];

export function UsersPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const filteredUsers = mockUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleColor = (role: User['role']) => {
        return role === 'admin' ? 'primary' : 'default';
    };

    const getStatusColor = (status: User['subscriptionStatus']) => {
        switch (status) {
            case 'active': return 'success';
            case 'trial': return 'info';
            case 'canceled': return 'warning';
            case 'expired': return 'error';
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Users
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />}>
                    Add User
                </Button>
            </Box>

            <Card>
                <CardContent sx={{ pb: 0 }}>
                    <TextField
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        sx={{ width: 300 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="disabled" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </CardContent>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Subscription</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight={500}>{user.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            color={getRoleColor(user.role)}
                                            size="small"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.subscriptionStatus.replace('_', ' ')}
                                            color={getStatusColor(user.subscriptionStatus)}
                                            size="small"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" title="Edit">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" title="Block" color="error">
                                            <BlockIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Card>
        </Box>
    );
}

// online-exam-frontend/src/pages/admin/UsersPage.tsx
import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Box,
    Typography,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import axiosInstance from '../../config/axios';

interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    enabled: boolean;
    createdAt: string;
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({
        fullName: '',
        email: '',
        role: 'STUDENT',
        enabled: true
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/admin/users');
            setUsers(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch users');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setEditForm({
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            enabled: user.enabled
        });
        setOpenDialog(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        try {
            await axiosInstance.put(`/admin/users/${selectedUser.id}`, editForm);
            setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
            setOpenDialog(false);
            fetchUsers(); // Refresh list
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to update user', severity: 'error' });
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await axiosInstance.delete(`/admin/users/${id}`);
            setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
            fetchUsers();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to delete user', severity: 'error' });
        }
    };

    const handleToggleStatus = async (user: User) => {
        try {
            await axiosInstance.put(`/admin/users/${user.id}`, {
                ...user,
                enabled: !user.enabled
            });
            setSnackbar({
                open: true,
                message: `User ${!user.enabled ? 'enabled' : 'disabled'} successfully`,
                severity: 'success'
            });
            fetchUsers();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to update user status', severity: 'error' });
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'TEACHER': return 'warning';
            case 'STUDENT': return 'success';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">User Management</Typography>
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={fetchUsers}
                    >
                        Refresh
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Full Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.fullName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            color={getRoleColor(user.role)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.enabled ? 'Active' : 'Disabled'}
                                            color={user.enabled ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditClick(user)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleToggleStatus(user)}
                                            color={user.enabled ? "error" : "success"}
                                        >
                                            {user.enabled ? <BlockIcon /> : <CheckCircleIcon />}
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteUser(user.id)}
                                            color="error"
                                            disabled={user.role === 'ADMIN'} // Prevent deleting admin
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {users.length === 0 && !loading && (
                    <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                        No users found
                    </Typography>
                )}
            </Paper>

            {/* Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            select
                            label="Role"
                            value={editForm.role}
                            onChange={(e) => setEditForm({...editForm, role: e.target.value as any})}
                            margin="normal"
                        >
                            <MenuItem value="STUDENT">Student</MenuItem>
                            <MenuItem value="TEACHER">Teacher</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            value={editForm.enabled ? 'active' : 'inactive'}
                            onChange={(e) => setEditForm({...editForm, enabled: e.target.value === 'active'})}
                            margin="normal"
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateUser}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({...snackbar, open: false})}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({...snackbar, open: false})}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default UsersPage;
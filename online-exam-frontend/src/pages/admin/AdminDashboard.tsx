// online-exam-frontend/src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Paper,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    AdminPanelSettings as AdminIcon,
    Assessment as AssessmentIcon,
    BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';

interface Stats {
    totalUsers: number;
    students: number;
    teachers: number;
    admins: number;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/admin/stats');
            setStats(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch statistics');
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
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
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{xs:12, sm:6, md:3}}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography color="textSecondary" variant="body2">
                                        Total Users
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats?.totalUsers || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs:12, sm:6, md:3}}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <SchoolIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography color="textSecondary" variant="body2">
                                        Students
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats?.students || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs:12, sm:6, md:3}}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AdminIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography color="textSecondary" variant="body2">
                                        Teachers
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats?.teachers || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs:12, sm:6, md:3}}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AssessmentIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography color="textSecondary" variant="body2">
                                        Admins
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats?.admins || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Quick Actions
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate('/admin/users')}
                            startIcon={<PeopleIcon />}
                        >
                            Manage Users
                        </Button>
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate('/admin/exams')}
                            startIcon={<AssessmentIcon />}
                        >
                            Manage Exams
                        </Button>
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate('/admin/reports')}
                            startIcon={<BarChartIcon />}
                        >
                            View Reports
                        </Button>
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate('/admin/settings')}
                            startIcon={<AdminIcon />}
                        >
                            System Settings
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Recent Activity
                </Typography>
                <Typography color="text.secondary">
                    No recent activity to display.
                </Typography>
            </Paper>
        </Container>
    );
};

export default AdminDashboard;
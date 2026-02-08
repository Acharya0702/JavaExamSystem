import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    IconButton,
    LinearProgress,
    Alert,
    Snackbar,
    Chip,
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useNavigate } from 'react-router-dom';

interface Exam {
    id: number;
    title: string;
    description: string;
    totalQuestions: number;
    studentsTaken: number; // Changed from totalStudents
    averageScore: number;
    status: 'draft' | 'published' | 'completed';
    createdAt: string;
    totalMarks?: number;
    passingMarks?: number;
    duration?: number;
}

interface DashboardStats {
    totalExams: number;
    totalQuestions: number;
    studentsTakenExams: number; // Students who have taken exams
    totalEnrolledStudents: number; // All student users in system
    activeExams: number;
}

interface ApiResponse {
    exams?: any[];
    stats?: {
        totalExams: number;
        totalQuestions: number;
        studentsTakenExams: number;
        totalEnrolledStudents: number;
        activeExams: number;
    };
    error?: string;
}

const TeacherDashboard: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalExams: 0,
        totalQuestions: 0,
        studentsTakenExams: 0,
        totalEnrolledStudents: 0,
        activeExams: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        fetchTeacherData();
    }, []);

    const fetchTeacherData = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

            if (!token) {
                console.error('No token found in localStorage');
                navigate('/login');
                return;
            }

            console.log('Fetching teacher dashboard data...');

            const response = await fetch('http://localhost:8080/teacher/dashboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('accessToken');
                navigate('/login');
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data: ApiResponse = await response.json();
            console.log('Teacher dashboard data received:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            // Transform exams data - UPDATED to match new field names
            const examsData: Exam[] = (data.exams || []).map((exam: any) => ({
                id: exam.id,
                title: exam.title || 'Untitled Exam',
                description: exam.description || 'No description',
                totalQuestions: exam.totalQuestions || 0,
                studentsTaken: exam.studentsTaken || 0, // Changed field
                averageScore: exam.averageScore || 0,
                status: (exam.status || 'draft').toLowerCase() as 'draft' | 'published' | 'completed',
                createdAt: exam.createdAt || new Date().toISOString(),
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
                duration: exam.duration,
            }));

            // Transform stats data - UPDATED to match new field names
            const statsData: DashboardStats = {
                totalExams: data.stats?.totalExams || 0,
                totalQuestions: data.stats?.totalQuestions || 0,
                studentsTakenExams: data.stats?.studentsTakenExams || 0, // Changed field
                totalEnrolledStudents: data.stats?.totalEnrolledStudents || 0, // New field
                activeExams: data.stats?.activeExams || 0,
            };

            console.log('Transformed exams:', examsData);
            console.log('Transformed stats:', statsData);

            setExams(examsData);
            setStats(statsData);
            setSnackbar({
                open: true,
                message: 'Dashboard data loaded successfully',
                severity: 'success'
            });

        } catch (error: any) {
            console.error('Error fetching teacher data:', error);
            setError(error.message || 'Failed to load dashboard data');
            setSnackbar({
                open: true,
                message: error.message || 'Failed to load dashboard data',
                severity: 'error'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTeacherData();
    };

    const handleDeleteExam = async (examId: number, examTitle: string) => {
        if (window.confirm(`Are you sure you want to delete "${examTitle}"?`)) {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

                const response = await fetch(`http://localhost:8080/teacher/exams/${examId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    setExams(exams.filter(exam => exam.id !== examId));
                    setSnackbar({
                        open: true,
                        message: 'Exam deleted successfully',
                        severity: 'success'
                    });

                    // Update stats after deletion
                    setStats(prev => ({
                        ...prev,
                        totalExams: prev.totalExams - 1
                    }));
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete exam');
                }
            } catch (error: any) {
                console.error('Error deleting exam:', error);
                setSnackbar({
                    open: true,
                    message: error.message || 'Failed to delete exam',
                    severity: 'error'
                });
            }
        }
    };

    const handleViewDetails = (examId: number) => {
        navigate(`/teacher/exams/${examId}`);
    };

    const handleEditExam = (examId: number) => {
        navigate(`/teacher/exams/${examId}/edit`);
    };

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'success';
            case 'draft':
                return 'warning';
            case 'completed':
                return 'info';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <LinearProgress sx={{ width: '50%' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header Section */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Teacher Dashboard
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Welcome back, {user?.fullName || user?.username || 'Teacher'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/teacher/exams/create')}
                    >
                        Create Exam
                    </Button>
                </Box>
            </Box>

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Statistics Cards - UPDATED WITH NEW FIELDS */}
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Overview
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{xs:12, sm:6, md:3}}>
                    <Card
                        sx={{
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}
                    >
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Total Exams
                            </Typography>
                            <Typography
                                variant="h3"
                                component="div"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 'bold'
                                }}
                            >
                                {stats.totalExams}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                    exams created
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs:12, sm:6, md:3}}>
                    <Card
                        sx={{
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}
                    >
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Total Questions
                            </Typography>
                            <Typography
                                variant="h3"
                                component="div"
                                sx={{
                                    color: 'secondary.main',
                                    fontWeight: 'bold'
                                }}
                            >
                                {stats.totalQuestions}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                    questions created
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* NEW: Total Enrolled Students Card */}
                <Grid size={{xs:12, sm:6, md:3}}>
                    <Card
                        sx={{
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}
                    >
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Total Students
                            </Typography>
                            <Typography
                                variant="h3"
                                component="div"
                                sx={{
                                    color: 'success.main',
                                    fontWeight: 'bold'
                                }}
                            >
                                {stats.totalEnrolledStudents}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                    students enrolled
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* NEW: Students Taken Exams Card */}
                <Grid size={{xs:12, sm:6, md:3}}>
                    <Card
                        sx={{
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}
                    >
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Exam Attempts
                            </Typography>
                            <Typography
                                variant="h3"
                                component="div"
                                sx={{
                                    color: 'info.main',
                                    fontWeight: 'bold'
                                }}
                            >
                                {stats.studentsTakenExams}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                    exam attempts
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Active Exams Card */}
            <Grid size={{xs:12}} sx={{ mb: 4 }}>
                <Card
                    sx={{
                        height: '100%',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' }
                    }}
                >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                            Active Exams
                        </Typography>
                        <Typography
                            variant="h3"
                            component="div"
                            sx={{
                                color: 'warning.main',
                                fontWeight: 'bold'
                            }}
                        >
                            {stats.activeExams}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">
                                published and available
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Exams List Section */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Typography variant="h5">
                    My Exams ({exams.length})
                </Typography>
                <Chip
                    label={`${exams.filter(e => e.status === 'published').length} Published`}
                    color="success"
                    variant="outlined"
                    size="small"
                />
            </Box>

            {exams.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        No exams found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        You haven't created any exams yet. Start by creating your first exam!
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/teacher/exams/create')}
                    >
                        Create Your First Exam
                    </Button>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {exams.map((exam) => (
                        <Grid size={{xs:12, md:6, lg:4}} key={exam.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: 6,
                                        transform: 'translateY(-4px)'
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    {/* Exam Header */}
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 2
                                    }}>
                                        <Box sx={{ flex: 1, mr: 1 }}>
                                            <Typography
                                                variant="h6"
                                                component="h2"
                                                sx={{
                                                    fontWeight: 600,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}
                                            >
                                                {exam.title}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="textSecondary"
                                                sx={{ display: 'block', mt: 0.5 }}
                                            >
                                                Created: {formatDate(exam.createdAt)}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <IconButton
                                                size="small"
                                                title="Edit"
                                                onClick={() => handleEditExam(exam.id)}
                                                sx={{ mr: 0.5 }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                title="Delete"
                                                onClick={() => handleDeleteExam(exam.id, exam.title)}
                                                sx={{ color: 'error.main' }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    {/* Exam Description */}
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        paragraph
                                        sx={{
                                            mb: 2,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical'
                                        }}
                                    >
                                        {exam.description}
                                    </Typography>

                                    {/* Exam Stats - UPDATED FIELD NAME */}
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: 1.5,
                                        mb: 2
                                    }}>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Questions
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {exam.totalQuestions}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Attempts
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {exam.studentsTaken} {/* Changed field */}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Avg Score
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {exam.averageScore.toFixed(1)}%
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Duration
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {exam.duration || 'N/A'} min
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Additional Exam Info */}
                                    {exam.totalMarks && exam.passingMarks && (
                                        <Box sx={{
                                            backgroundColor: 'grey.50',
                                            p: 1,
                                            borderRadius: 1,
                                            mb: 2
                                        }}>
                                            <Typography variant="caption" color="textSecondary">
                                                Marks: {exam.totalMarks} total, {exam.passingMarks} to pass
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Status and Actions */}
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mt: 'auto'
                                    }}>
                                        <Chip
                                            label={exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                            color={getStatusColor(exam.status) as any}
                                            size="small"
                                        />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleViewDetails(exam.id)}
                                        >
                                            View Details
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Summary Section */}
            {exams.length > 0 && (
                <Card sx={{ mt: 4, p: 3, backgroundColor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                        Exam Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="body2" color="textSecondary">
                                Total Exams
                            </Typography>
                            <Typography variant="h6">
                                {stats.totalExams}
                            </Typography>
                        </Grid>
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="body2" color="textSecondary">
                                Total Students
                            </Typography>
                            <Typography variant="h6">
                                {stats.totalEnrolledStudents}
                            </Typography>
                        </Grid>
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="body2" color="textSecondary">
                                Total Attempts
                            </Typography>
                            <Typography variant="h6">
                                {stats.studentsTakenExams}
                            </Typography>
                        </Grid>
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="body2" color="textSecondary">
                                Active Exams
                            </Typography>
                            <Typography variant="h6">
                                {stats.activeExams}
                            </Typography>
                        </Grid>
                    </Grid>
                </Card>
            )}

            {/* Additional Actions */}
            {exams.length > 0 && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Showing {exams.length} exam{exams.length !== 1 ? 's' : ''}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        Back to Top
                    </Button>
                </Box>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherDashboard;
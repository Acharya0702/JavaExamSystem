import React, {useState, useEffect} from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    LinearProgress,
    Chip,
    Stack,
    Divider,
    Alert,
    Snackbar,
} from '@mui/material';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {useNavigate} from 'react-router-dom';
import {
    CalendarToday,
    AccessTime,
    Assignment,
    Score,
    CheckCircle,
    Schedule,
    Error as ErrorIcon,
} from '@mui/icons-material';
import {examAPI} from "../../api/exam";

interface Exam {
    id: number;
    title: string;
    date: string;
    duration: number;
    totalQuestions: number;
    status: 'upcoming' | 'completed';
}

interface ExamResult {
    id: number;
    examTitle: string;
    score: number;
    totalMarks: number;
    percentage: number;
    dateTaken: string;
}

interface DashboardStats {
    totalExams: number;
    completedExams: number;
    averageScore: number;
    upcomingExams: number;
}

const StudentDashboard: React.FC = () => {
    const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
    const [completedExams, setCompletedExams] = useState<ExamResult[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalExams: 0,
        completedExams: 0,
        averageScore: 0,
        upcomingExams: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);
    const {user} = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            setError(null);
            setLoading(true);

            console.log('🔄 Fetching student dashboard data via examAPI...');

            try {
                const data = await examAPI.getStudentDashboard();
                console.log('✅ FULL Student dashboard API response:', data);
                console.log('✅ Upcoming exams from API:', data.upcomingExams);

                // DEBUG: Log the first exam to see all fields
                if (data.upcomingExams && data.upcomingExams.length > 0) {
                    console.log('🔍 First exam raw data:', data.upcomingExams[0]);
                    console.log('🔍 Available field exists?', 'available' in data.upcomingExams[0]);
                    console.log('🔍 Available value:', data.upcomingExams[0].available);
                    console.log('🔍 isPublished value:', data.upcomingExams[0].isPublished);
                    console.log('🔍 status value:', data.upcomingExams[0].status);
                }

                // Update state with received data - FIXED TRANSFORMATION
                if (data.upcomingExams && Array.isArray(data.upcomingExams)) {
                    console.log(`📝 Setting ${data.upcomingExams.length} upcoming exams`);

                    setUpcomingExams(data.upcomingExams.map((exam: any) => {
                        // Create the transformed object with ALL fields
                        const transformedExam = {
                            id: exam.id || 0,
                            title: exam.title || 'Untitled Exam',
                            // Use startTime or createdAt for date display
                            date: exam.startTime || exam.createdAt || 'Unknown Date',
                            duration: exam.duration || 60,
                            totalQuestions: exam.totalQuestions || 0,
                            status: 'upcoming', // This is for UI display

                            // ADD THESE CRITICAL FIELDS:
                            available: exam.available, // This is now included!
                            isPublished: exam.isPublished,
                            startTime: exam.startTime,
                            endTime: exam.endTime,
                            examStatus: exam.status, // Store the actual status
                            publishedAt: exam.publishedAt,
                            createdBy: exam.createdBy,
                            passingMarks: exam.passingMarks,
                            totalMarks: exam.totalMarks,
                            description: exam.description,

                            // Keep raw data for debugging
                            _raw: exam
                        };

                        console.log('🔍 Transformed exam:', transformedExam);
                        return transformedExam;
                    }));
                } else {
                    console.log('⚠️ No upcomingExams array found in response');
                    setUpcomingExams([]);
                }

                if (data.completedExams && Array.isArray(data.completedExams)) {
                    console.log(`📝 Setting ${data.completedExams.length} completed exams`);
                    setCompletedExams(data.completedExams.map((exam: any) => ({
                        id: exam.id || 0,
                        examTitle: exam.examTitle || exam.title || 'Completed Exam',
                        score: exam.score || 0,
                        totalMarks: exam.totalMarks || 100,
                        percentage: exam.percentage || (exam.score && exam.totalMarks ?
                            Math.round((exam.score / exam.totalMarks) * 100) : 0),
                        dateTaken: exam.dateTaken || exam.submittedAt || new Date().toISOString()
                    })));
                } else {
                    console.log('⚠️ No completedExams array found in response');
                    setCompletedExams([]);
                }

                if (data.stats && typeof data.stats === 'object') {
                    console.log('📝 Setting stats:', data.stats);
                    setStats({
                        totalExams: data.stats.totalExams || 0,
                        completedExams: data.stats.completedExams || 0,
                        averageScore: data.stats.averageScore || 0,
                        upcomingExams: data.stats.upcomingExams || 0,
                    });
                } else {
                    console.log('⚠️ No stats object found in response');
                    setStats({
                        totalExams: 0,
                        completedExams: 0,
                        averageScore: 0,
                        upcomingExams: 0,
                    });
                }

            } catch (apiError: any) {
                console.error('❌ Error from examAPI:', apiError);
                // ... fallback code
            }

        } catch (error) {
            console.error('❌ Error fetching student data:', error);
            // ... error handling
        } finally {
            console.log('🏁 Setting loading to false');
            setLoading(false);
        }
    };


    const handleStartExam = (examId: number) => {
        navigate(`/exam/${examId}`);
    };

    const handleViewResults = (resultId: number) => {
        navigate(`/results/${resultId}`);
    };

    const handleCloseError = () => {
        setShowError(false);
    };

    const handleRetry = () => {
        fetchStudentData();
    };

    if (loading) {
        return (
            <Box sx={{width: '100%', mt: 4, p: 3}}>
                <Typography variant="h6" gutterBottom>
                    Loading your dashboard...
                </Typography>
                <LinearProgress/>
                <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                    Fetching data from server...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{p: 3}}>
            {/* Error Snackbar */}
            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert
                    severity="error"
                    onClose={handleCloseError}
                    action={
                        <Button color="inherit" size="small" onClick={handleRetry}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Snackbar>


            {/* Welcome Header */}
            <Box sx={{mb: 4}}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user?.fullName || 'Student'}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Role: {user?.role || 'Unknown'} | Email: {user?.email || 'Not available'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Here's your learning dashboard
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Typography variant="h5" gutterBottom sx={{mb: 2}}>
                Overview
            </Typography>
            <Grid container spacing={3} sx={{mb: 4}}>
                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Assignment color="primary"/>
                                <Box>
                                    <Typography color="textSecondary" variant="body2">
                                        Total Exams
                                    </Typography>
                                    <Typography variant="h5">
                                        {stats.totalExams}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <CheckCircle color="success"/>
                                <Box>
                                    <Typography color="textSecondary" variant="body2">
                                        Completed
                                    </Typography>
                                    <Typography variant="h5">
                                        {stats.completedExams}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Score color="warning"/>
                                <Box>
                                    <Typography color="textSecondary" variant="body2">
                                        Average Score
                                    </Typography>
                                    <Typography variant="h5">
                                        {stats.averageScore}%
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 3}}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Schedule color="info"/>
                                <Box>
                                    <Typography color="textSecondary" variant="body2">
                                        Upcoming
                                    </Typography>
                                    <Typography variant="h5">
                                        {stats.upcomingExams}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{my: 4}}/>

            {/* Upcoming Exams Section */}
            <Box sx={{mb: 6}}>
                <Typography variant="h5" gutterBottom sx={{mb: 3, display: 'flex', alignItems: 'center'}}>
                    <CalendarToday sx={{mr: 1}}/>
                    Upcoming Exams ({upcomingExams.length})
                </Typography>

                {upcomingExams.length === 0 ? (
                    <Card>
                        <CardContent>
                            <Stack alignItems="center" spacing={2}>
                                <Schedule sx={{fontSize: 48, color: 'text.disabled'}}/>
                                <Typography align="center" color="textSecondary">
                                    No upcoming exams scheduled
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Check back later for new exams
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {upcomingExams.map((exam) => (
                            <Grid size={{xs: 12, md: 6}} key={exam.id}>
                                <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                    <CardContent sx={{flexGrow: 1}}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            mb: 2
                                        }}>
                                            <Typography variant="h6" sx={{flex: 1, mr: 1}}>
                                                {exam.title}
                                            </Typography>
                                            <Chip
                                                label="Upcoming"
                                                color="primary"
                                                size="small"
                                                icon={<Schedule/>}
                                            />
                                        </Box>

                                        <Stack spacing={1.5} sx={{mb: 3}}>
                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                <CalendarToday fontSize="small"
                                                               sx={{mr: 1.5, color: 'text.secondary'}}/>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Date:</strong> {new Date(exam.date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                                </Typography>
                                            </Box>
                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                <AccessTime fontSize="small" sx={{mr: 1.5, color: 'text.secondary'}}/>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Duration:</strong> {exam.duration} minutes
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Questions:</strong> {exam.totalQuestions}
                                            </Typography>
                                        </Stack>

                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => handleStartExam(exam.id)}
                                            disabled={exam.status !== 'upcoming'}
                                            sx={{mt: 'auto'}}
                                        >
                                            {exam.status === 'upcoming' ? 'View Exam Details' : 'Start Exam Now'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Completed Exams Section */}
            <Box sx={{mb: 6}}>
                <Typography variant="h5" gutterBottom sx={{mb: 3, display: 'flex', alignItems: 'center'}}>
                    <CheckCircle sx={{mr: 1}}/>
                    Completed Exams ({completedExams.length})
                </Typography>

                {completedExams.length === 0 ? (
                    <Card>
                        <CardContent>
                            <Stack alignItems="center" spacing={2}>
                                <CheckCircle sx={{fontSize: 48, color: 'text.disabled'}}/>
                                <Typography align="center" color="textSecondary">
                                    No exams completed yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Complete your first exam to see results here
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/exams')}
                                    sx={{mt: 1}}
                                >
                                    Browse Available Exams
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {completedExams.map((result) => (
                            <Grid size={{xs: 12, md: 6}} key={result.id}>
                                <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                    <CardContent sx={{flexGrow: 1}}>
                                        <Typography variant="h6" gutterBottom>
                                            {result.examTitle}
                                        </Typography>

                                        {/* Score Progress */}
                                        <Box sx={{mb: 3}}>
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Score:</strong> {result.score}/{result.totalMarks}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>{result.percentage}%</strong>
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={result.percentage}
                                                sx={{
                                                    height: 10,
                                                    borderRadius: 5,
                                                    backgroundColor: 'grey.200',
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: result.percentage >= 70 ? 'success.main' :
                                                            result.percentage >= 50 ? 'warning.main' : 'error.main',
                                                        borderRadius: 5,
                                                    }
                                                }}
                                            />
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 0.5}}>
                                                <Typography variant="caption" color="text.secondary">
                                                    0%
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    100%
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            <strong>Completed:</strong> {new Date(result.dateTaken).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        </Typography>

                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            sx={{mt: 2}}
                                            onClick={() => handleViewResults(result.id)}
                                        >
                                            View Detailed Results & Analysis
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Quick Actions */}
            <Card sx={{mt: 4}}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                        <Schedule sx={{mr: 1}}/>
                        Quick Actions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                        Manage your exams and view your progress
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{xs: 12, sm: 6, md: 3}}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => navigate('/exams')}
                                startIcon={<Assignment/>}
                            >
                                Browse All Exams
                            </Button>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6, md: 3}}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => navigate('/results')}
                                startIcon={<Score/>}
                            >
                                View All Results
                            </Button>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6, md: 3}}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => navigate('/profile')}
                                startIcon={<CheckCircle/>}
                            >
                                My Profile
                            </Button>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6, md: 3}}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => navigate('/help')}
                                startIcon={<ErrorIcon/>}
                            >
                                Help Center
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Debug Panel (only in development) */}
            {process.env.NODE_ENV === 'development' && (
                <Card sx={{mt: 3, bgcolor: 'grey.50'}}>
                    <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Debug Information
                        </Typography>
                        <Typography variant="caption" component="div">
                            <strong>Upcoming Exams:</strong> {upcomingExams.length}
                        </Typography>
                        <Typography variant="caption" component="div">
                            <strong>Completed Exams:</strong> {completedExams.length}
                        </Typography>
                        <Typography variant="caption" component="div">
                            <strong>Loading State:</strong> {loading ? 'true' : 'false'}
                        </Typography>
                        <Typography variant="caption" component="div">
                            <strong>Error:</strong> {error || 'none'}
                        </Typography>
                        <Button
                            size="small"
                            variant="text"
                            onClick={handleRetry}
                            sx={{mt: 1}}
                        >
                            Retry API Call
                        </Button>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default StudentDashboard;
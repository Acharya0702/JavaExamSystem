import React, {useState, useEffect} from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Box,
    Alert,
    CircularProgress,
    Divider,
    Stack,
    Tooltip
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    AccessTime as TimeIcon,
    BarChart as ChartIcon,
    School as SchoolIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {examAPI} from '../../api/exam';
import {Exam} from '../../types/exam.types';

const StudentExamsPage: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAvailableExams();
    }, []);

    const fetchAvailableExams = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📡 Fetching available exams...');

            const data = await examAPI.getAvailableExams();
            console.log('✅ Raw response from API:', data);

            console.log('✅ Raw response from API:', data);

            // Log each exam's details
            data.forEach((exam: any, index: number) => {
                console.log(`🔍 Exam ${index + 1}:`, {
                    id: exam.id,
                    title: exam.title,
                    status: exam.status,
                    isPublished: exam.isPublished,
                    available: exam.available,
                    startTime: exam.startTime,
                    endTime: exam.endTime,
                    currentTime: new Date().toISOString(),
                    isPublishedValue: exam.isPublished,
                    statusValue: exam.status
                });
            });
            // Transform the data to match Exam interface
            const transformedExams: Exam[] = data.map((exam: any) => ({
                id: exam.id || 0,
                title: exam.title || 'Untitled Exam',
                description: exam.description || '',
                duration: exam.duration || 60,
                totalMarks: exam.totalMarks || 100,
                passingMarks: exam.passingMarks || 50,
                status: exam.status || 'DRAFT',
                isPublished: exam.isPublished || false,
                startTime: exam.startTime || null,
                endTime: exam.endTime || null,
                available: exam.available || false,
                createdBy: exam.createdBy || 'Unknown',
                createdAt: exam.createdAt || new Date().toISOString(),
                publishedAt: exam.publishedAt || null,
                questionCount: exam.questionCount || exam.totalQuestions || 0,
                totalQuestions: exam.totalQuestions || exam.questionCount || 0
            }));

            console.log('🔄 Transformed exams:', transformedExams);
            setExams(transformedExams);

        } catch (err: any) {
            console.error('❌ Error fetching exams:', err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch available exams');
        } finally {
            setLoading(false);
        }
    };

    const handleTakeExam = (examId: number) => {
        navigate(`/exam/${examId}`);
    };

    const handleViewResults = () => {
        navigate('/student/results');
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PUBLISHED':
                return 'success';
            case 'DRAFT':
                return 'warning';
            case 'COMPLETED':
                return 'info';
            case 'ACTIVE':
                return 'primary';
            default:
                return 'default';
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} minutes`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Container sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
                <CircularProgress/>
                <Typography variant="body1" sx={{ml: 2}}>
                    Loading available exams...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
            <Paper elevation={3} sx={{p: 3, borderRadius: 2}}>
                {/* Header */}
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <AssignmentIcon sx={{mr: 2, fontSize: 40, color: 'primary.main'}}/>
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Available Exams
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Browse and take available exams
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<ChartIcon/>}
                        onClick={handleViewResults}
                        size="large"
                    >
                        View Results
                    </Button>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{mb: 3}}
                        action={
                            <Button color="inherit" size="small" onClick={fetchAvailableExams}>
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                )}

                {/* No Exams Message */}
                {exams.length === 0 && !loading && !error && (
                    <Alert severity="info" sx={{mb: 3}}>
                        <Typography variant="body1" gutterBottom>
                            No exams available at the moment.
                        </Typography>
                        <Typography variant="body2">
                            Please check back later or contact your instructor for more information.
                        </Typography>
                    </Alert>
                )}

                {/* Exams Grid */}
                {exams.length > 0 && (
                    <Grid container spacing={3}>
                        {exams.map((exam) => (
                            <Grid size={{xs:12, md:6, lg:4}} key={exam.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                },
                                border: exam.available ? '2px solid #4caf50' : '2px solid #ff9800',
                                position: 'relative'
                            }}
                        >
                            {/* Status Badge */}
                            <Box sx={{position: 'absolute', top: 10, right: 10}}>
                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        label={exam.status}
                                        color={getStatusColor(exam.status)}
                                        size="small"
                                        variant="outlined"
                                    />
                                    {exam.available && (
                                        <Chip
                                            label="Available"
                                            color="success"
                                            size="small"
                                            icon={<CheckCircleIcon/>}
                                        />
                                    )}
                                </Stack>
                            </Box>

                            <CardContent sx={{flexGrow: 1, pt: 6}}>
                                {/* Exam Title */}
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {exam.title}
                                </Typography>

                                {/* Exam Description */}
                                <Typography variant="body2" color="text.secondary" paragraph sx={{mb: 2}}>
                                    {exam.description || 'No description available.'}
                                </Typography>

                                <Divider sx={{my: 2}}/>

                                {/* Exam Details */}
                                <Grid container spacing={2}>
                                    <Grid size={{xs: 6}}>
                                        <Tooltip title="Exam duration">
                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                <TimeIcon fontSize="small" sx={{mr: 1, color: 'primary.main'}}/>
                                                <Typography variant="body2">
                                                    {formatDuration(exam.duration)}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                    <Grid size={{xs: 6}}>
                                        <Tooltip title="Number of questions">
                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                <SchoolIcon fontSize="small" sx={{mr: 1, color: 'primary.main'}}/>
                                                <Typography variant="body2">
                                                    {exam.questionCount} Qs
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                    <Grid size={{xs: 6}}>
                                        <Tooltip title="Total marks">
                                            <Typography variant="body2">
                                                📝 {exam.totalMarks} marks
                                            </Typography>
                                        </Tooltip>
                                    </Grid>
                                    <Grid size={{xs: 6}}>
                                        <Tooltip title="Passing marks">
                                            <Typography variant="body2">
                                                🎯 {exam.passingMarks} to pass
                                            </Typography>
                                        </Tooltip>
                                    </Grid>
                                </Grid>

                                {/* Time Constraints */}
                                {(exam.startTime || exam.endTime) && (
                                    <Box sx={{mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1}}>
                                        <Typography variant="caption" color="text.secondary" display="block"
                                                    gutterBottom>
                                            <InfoIcon fontSize="small" sx={{mr: 0.5, verticalAlign: 'middle'}}/>
                                            Time Constraints:
                                        </Typography>
                                        {exam.startTime && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Starts: {formatDate(exam.startTime)}
                                            </Typography>
                                        )}
                                        {exam.endTime && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Ends: {formatDate(exam.endTime)}
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                {/* Creator Info */}
                                <Typography variant="caption" color="text.secondary" display="block" sx={{mt: 2}}>
                                    Created by: {exam.createdBy}
                                </Typography>
                                {exam.publishedAt && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Published: {formatDate(exam.publishedAt)}
                                    </Typography>
                                )}
                            </CardContent>

                            {/* Action Button */}
                            <CardActions sx={{p: 2, pt: 0}}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={() => handleTakeExam(exam.id)}
                                    disabled={!exam.available || exam.status !== 'PUBLISHED'}
                                    startIcon={<AssignmentIcon/>}
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        borderRadius: 1
                                    }}
                                >
                                    {exam.available ? 'Take Exam Now' : 'Exam Not Available'}

                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            )}

            {/* Stats Footer */}
            {exams.length > 0 && (
                <Box sx={{mt: 4, pt: 2, borderTop: 1, borderColor: 'divider'}}>
                    <Grid container spacing={2}>
                        <Grid size={{xs: 6, md: 3}}>
                            <Paper variant="outlined" sx={{p: 2, textAlign: 'center'}}>
                                <Typography variant="h6" color="primary">
                                    {exams.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Exams
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{xs: 6, md: 3}}>
                            <Paper variant="outlined" sx={{p: 2, textAlign: 'center'}}>
                                <Typography variant="h6" color="success.main">
                                    {exams.filter(e => e.available).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Available Now
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{xs: 6, md: 3}}>
                            <Paper variant="outlined" sx={{p: 2, textAlign: 'center'}}>
                                <Typography variant="h6" color="warning.main">
                                    {exams.filter(e => e.status === 'PUBLISHED').length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Published
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{xs: 6, md: 3}}>
                            <Paper variant="outlined" sx={{p: 2, textAlign: 'center'}}>
                                <Typography variant="h6" color="info.main">
                                    {exams.filter(e => e.isPublished).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Active
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Paper>
</Container>
)
    ;
};

export default StudentExamsPage;
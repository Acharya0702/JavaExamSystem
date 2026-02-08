import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Chip,
    Button,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    CheckCircle as PassIcon,
    Cancel as FailIcon,
    AccessTime as TimeIcon,
    ExpandMore as ExpandMoreIcon,
    Check as CorrectIcon,
    Close as IncorrectIcon,
    TrendingUp as ChartIcon,
    Score as ScoreIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI } from '../../api/exam';
import { ExamResult } from '../../types/exam.types';

const SingleResultPage: React.FC = () => {
    const { resultId } = useParams<{ resultId: string }>();
    const navigate = useNavigate();

    const [detailedResult, setDetailedResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | false>(false);

    useEffect(() => {
        if (resultId) {
            fetchDetailedResult();
        }
    }, [resultId]);

    const fetchDetailedResult = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await examAPI.getResultById(parseInt(resultId!));
            setDetailedResult(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch result details');
            console.error('Error fetching result details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const getStatusIcon = (status: string) => {
        return status === 'PASSED' ?
            <PassIcon color="success" /> :
            <FailIcon color="error" />;
    };

    const getStatusColor = (status: string) => {
        return status === 'PASSED' ? 'success' : 'error';
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const formatTimeTaken = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} minutes`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!detailedResult) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Result not found
                </Alert>
                <Button onClick={() => navigate('/student/results')}>
                    Back to Results
                </Button>
            </Container>
        );
    }

    const correctAnswers = detailedResult.answers.filter(a => a.isCorrect).length;
    const totalQuestions = detailedResult.answers.length;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">
                        <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Exam Result Details
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/results')}
                    >
                        Back to All Results
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {/* Result Summary Card */}
                <Card sx={{ mb: 4, bgcolor: detailedResult.status === 'PASSED' ? 'success.light' : 'error.light' }}>
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid size={{xs:12, sm:6, md:3}}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary">
                                        {detailedResult.percentage.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Score
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{xs:12, sm:6, md:3}}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4">
                                        {detailedResult.score}/{detailedResult.totalMarks}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Marks
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{xs:12, sm:6, md:3}}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4">
                                        {correctAnswers}/{totalQuestions}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Correct Answers
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{xs:12, sm:6, md:3}}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4">
                                        {formatTimeTaken(detailedResult.timeTaken)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Time Taken
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Chip
                                icon={getStatusIcon(detailedResult.status)}
                                label={detailedResult.status}
                                color={getStatusColor(detailedResult.status)}
                                sx={{
                                    fontSize: '1rem',
                                    px: 2,
                                    py: 1,
                                    height: 'auto'
                                }}
                            />
                        </Box>
                    </CardContent>
                </Card>

                <Typography variant="h5" gutterBottom>
                    Exam: {detailedResult.examTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Submitted on: {formatDateTime(detailedResult.submittedAt)}
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Detailed Answers */}
                <Typography variant="h6" gutterBottom>
                    Question-wise Analysis
                </Typography>

                {detailedResult.answers.map((answer, index) => (
                    <Accordion
                        key={answer.id}
                        expanded={expanded === `panel${index}`}
                        onChange={handleAccordionChange(`panel${index}`)}
                        sx={{ mb: 2 }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    {answer.isCorrect ?
                                        <CorrectIcon color="success" /> :
                                        <IncorrectIcon color="error" />
                                    }
                                </ListItemIcon>
                                <ListItemText
                                    primary={`Question ${index + 1}`}
                                    secondary={`${answer.pointsAwarded}/${answer.questionPoints} points`}
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1" paragraph>
                                <strong>Question:</strong> {answer.questionText}
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid size={{xs:12, md:6}}>
                                    <Typography variant="body2">
                                        <strong>Your Answer:</strong>
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: answer.isCorrect ? 'success.light' : 'error.light' }}>
                                        {answer.studentAnswer || "No answer provided"}
                                    </Paper>
                                </Grid>
                                <Grid size={{xs:12, md:6}}>
                                    <Typography variant="body2">
                                        <strong>Correct Answer:</strong>
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'info.light' }}>
                                        {answer.correctAnswer}
                                    </Paper>
                                </Grid>
                            </Grid>

                            {answer.explanation && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Explanation:</strong> {answer.explanation}
                                    </Typography>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Paper>
        </Container>
    );
};

export default SingleResultPage;
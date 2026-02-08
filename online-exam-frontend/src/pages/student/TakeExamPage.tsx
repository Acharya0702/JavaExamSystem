import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    TextField,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    LinearProgress
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    ArrowForward as NextIcon,
    Send as SubmitIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI } from '../../api/exam';
import { ExamWithQuestions, StudentAnswer } from '../../types/exam.types';

const TakeExamPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [exam, setExam] = useState<ExamWithQuestions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [timeTaken, setTimeTaken] = useState<number>(0);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchExam();
        }
    }, [id]);

    useEffect(() => {
        if (exam && exam.duration > 0) {
            const totalSeconds = exam.duration * 60;
            setTimeLeft(totalSeconds);

            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
                setTimeTaken(prev => prev + 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [exam]);

    const fetchExam = async () => {
        try {
            setLoading(true);
            setError(null);
            // Use getStudentExamById instead of getExamById
            const data = await examAPI.getStudentExamById(parseInt(id!));
            setExam(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load exam');
            console.error('Error fetching exam:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNext = () => {
        setActiveStep(prev => Math.min(prev + 1, exam!.questions.length - 1));
    };

    const handleBack = () => {
        setActiveStep(prev => Math.max(prev - 1, 0));
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAutoSubmit = async () => {
        await submitExam();
    };

    const handleSubmitClick = () => {
        setSubmitDialogOpen(true);
    };

    const handleSubmitConfirm = async () => {
        setSubmitDialogOpen(false);
        await submitExam();
    };

    const handleSubmitCancel = () => {
        setSubmitDialogOpen(false);
    };

    const submitExam = async () => {
        if (!exam) return;

        try {
            setSubmitting(true);

            // Prepare answers array
            const answerList: StudentAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
                questionId: parseInt(questionId),
                answer: answer || '' // Ensure answer is not undefined
            }));

            // Create submission data
            const takeExamRequest = {
                examId: exam.id,
                answers: answerList,
                timeTaken: Math.floor(timeTaken / 60) // Convert to minutes
            };

            console.log('Submitting exam request:', takeExamRequest);

            // Submit the exam
            const result = await examAPI.submitExam(takeExamRequest);

            // Navigate to results page
            navigate(`/results/${result.id}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit exam');
            console.error('Error submitting exam:', err);
            setSubmitting(false);
        }
    };

    const calculateProgress = () => {
        if (!exam) return 0;
        return (Object.keys(answers).length / exam.questions.length) * 100;
    };

    const getAnsweredQuestionCount = () => {
        return Object.keys(answers).filter(key => answers[parseInt(key)]?.trim() !== '').length;
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !exam) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error || 'Exam not found'}</Alert>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/student/exams')}
                    sx={{ mt: 2 }}
                >
                    Back to Exams
                </Button>
            </Container>
        );
    }

    const currentQuestion = exam.questions[activeStep];
    const answeredCount = getAnsweredQuestionCount();


    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4">{exam.title}</Typography>
                        <Typography variant="body1" color="text.secondary">
                            {exam.description}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', minWidth: '140px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TimeIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">
                                {formatTime(timeLeft)}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Time Remaining
                        </Typography>
                    </Box>
                </Box>

                {/* Progress bars */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Time Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formatTime(timeTaken)}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={((exam.duration * 60 - timeLeft) / (exam.duration * 60)) * 100}
                        sx={{ height: 8, borderRadius: 4, mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Answer Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {answeredCount} of {exam.questions.length} answered
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={calculateProgress()}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {/* Question Stepper */}
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, overflowX: 'auto' }}>
                    {exam.questions.map((question, index) => (
                        <Step key={question.id}>
                            <StepLabel>
                                <Typography variant="caption">
                                    Q{index + 1}
                                    {answers[question.id] && (
                                        <Box component="span" sx={{ color: 'success.main', ml: 0.5 }}>
                                            ✓
                                        </Box>
                                    )}
                                </Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Current Question */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Question {activeStep + 1} of {exam.questions.length}
                        </Typography>

                        <Typography variant="body1" paragraph sx={{ mb: 3, fontWeight: 'medium', lineHeight: 1.6 }}>
                            {currentQuestion.text}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Points: {currentQuestion.points}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                •
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Type: {currentQuestion.type === 'MULTIPLE_CHOICE' ? 'Multiple Choice' :
                                currentQuestion.type === 'TRUE_FALSE' ? 'True/False' : 'Short Answer'}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Answer Options */}
                        <FormControl component="fieldset" sx={{ width: '100%' }}>
                            {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                                <>
                                    <FormLabel component="legend" sx={{ mb: 2 }}>
                                        Select the correct option:
                                    </FormLabel>
                                    <RadioGroup
                                        value={answers[currentQuestion.id] || ''}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                    >
                                        {[currentQuestion.option1, currentQuestion.option2, currentQuestion.option3, currentQuestion.option4]
                                            .filter(option => option && option.trim() !== '')
                                            .map((option, index) => (
                                                <Card
                                                    key={index}
                                                    sx={{
                                                        mb: 1,
                                                        border: answers[currentQuestion.id] === (index + 1).toString()
                                                            ? '2px solid #1976d2'
                                                            : '1px solid #e0e0e0',
                                                        backgroundColor: answers[currentQuestion.id] === (index + 1).toString()
                                                            ? 'rgba(25, 118, 210, 0.04)'
                                                            : 'transparent',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            borderColor: '#1976d2',
                                                            backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                                        }
                                                    }}
                                                >
                                                    <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                                                        <FormControlLabel
                                                            value={(index + 1).toString()}
                                                            control={<Radio />}
                                                            label={option}
                                                            sx={{ width: '100%', m: 0 }}
                                                        />
                                                    </CardContent>
                                                </Card>
                                            ))}
                                    </RadioGroup>
                                </>
                            )}

                            {currentQuestion.type === 'TRUE_FALSE' && (
                                <>
                                    <FormLabel component="legend" sx={{ mb: 2 }}>
                                        Select True or False:
                                    </FormLabel>
                                    <RadioGroup
                                        value={answers[currentQuestion.id] || ''}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        row
                                        sx={{ justifyContent: 'center', gap: 3 }}
                                    >
                                        <Card
                                            sx={{
                                                border: answers[currentQuestion.id] === 'true'
                                                    ? '2px solid #1976d2'
                                                    : '1px solid #e0e0e0',
                                                backgroundColor: answers[currentQuestion.id] === 'true'
                                                    ? 'rgba(25, 118, 210, 0.04)'
                                                    : 'transparent',
                                                width: '120px'
                                            }}
                                        >
                                            <CardContent sx={{ py: 1 }}>
                                                <FormControlLabel
                                                    value="true"
                                                    control={<Radio />}
                                                    label="True"
                                                    sx={{ width: '100%', m: 0 }}
                                                />
                                            </CardContent>
                                        </Card>
                                        <Card
                                            sx={{
                                                border: answers[currentQuestion.id] === 'false'
                                                    ? '2px solid #1976d2'
                                                    : '1px solid #e0e0e0',
                                                backgroundColor: answers[currentQuestion.id] === 'false'
                                                    ? 'rgba(25, 118, 210, 0.04)'
                                                    : 'transparent',
                                                width: '120px'
                                            }}
                                        >
                                            <CardContent sx={{ py: 1 }}>
                                                <FormControlLabel
                                                    value="false"
                                                    control={<Radio />}
                                                    label="False"
                                                    sx={{ width: '100%', m: 0 }}
                                                />
                                            </CardContent>
                                        </Card>
                                    </RadioGroup>
                                </>
                            )}

                            {currentQuestion.type === 'SHORT_ANSWER' && (
                                <>
                                    <FormLabel component="legend" sx={{ mb: 2 }}>
                                        Type your answer:
                                    </FormLabel>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        value={answers[currentQuestion.id] || ''}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        placeholder="Enter your answer here..."
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#1976d2',
                                                },
                                            }
                                        }}
                                    />
                                </>
                            )}
                        </FormControl>
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Button
                        startIcon={<BackIcon />}
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        variant="outlined"
                    >
                        Previous
                    </Button>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {activeStep < exam.questions.length - 1 ? (
                            <Button
                                endIcon={<NextIcon />}
                                onClick={handleNext}
                                variant="contained"
                            >
                                Next Question
                            </Button>
                        ) : (
                            <Button
                                variant="outlined"
                                onClick={() => setActiveStep(0)}
                            >
                                Review All
                            </Button>
                        )}

                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<SubmitIcon />}
                            onClick={handleSubmitClick}
                            disabled={submitting}
                            sx={{
                                backgroundColor: answeredCount === exam.questions.length
                                    ? '#2e7d32'
                                    : 'primary.main',
                                '&:hover': {
                                    backgroundColor: answeredCount === exam.questions.length
                                        ? '#1b5e20'
                                        : 'primary.dark'
                                }
                            }}
                        >
                            {submitting ? 'Submitting...' : 'Submit Exam'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Submit Confirmation Dialog */}
            <Dialog
                open={submitDialogOpen}
                onClose={handleSubmitCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Submit Exam</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Are you sure you want to submit your exam?
                    </DialogContentText>

                    <Box sx={{
                        backgroundColor: 'grey.50',
                        p: 2,
                        borderRadius: 1,
                        mb: 2
                    }}>
                        <Typography variant="body2" gutterBottom>
                            <strong>Exam Summary:</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Total Questions: {exam.questions.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Answered: {answeredCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Unanswered: {exam.questions.length - answeredCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Time Taken: {formatTime(timeTaken)}
                        </Typography>
                    </Box>

                    {answeredCount < exam.questions.length && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            You have {exam.questions.length - answeredCount} unanswered question(s).
                            You can still go back and answer them before submitting.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleSubmitCancel}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitConfirm}
                        color="primary"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                Submitting...
                            </>
                        ) : 'Yes, Submit Exam'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TakeExamPage;
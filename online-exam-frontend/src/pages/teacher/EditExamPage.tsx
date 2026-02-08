import React, {useState, useEffect} from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    FormHelperText,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider,
    Tooltip
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Publish as PublishIcon,
    Drafts as DraftIcon,
    ContentCopy as DuplicateIcon
} from '@mui/icons-material';
import {useNavigate, useParams} from 'react-router-dom';
import {examAPI} from '../../api/exam';
import {CreateExamRequest, CreateQuestionRequest} from '../../types/exam.types';

const steps = ['Exam Details', 'Questions', 'Review'];

const getInitialQuestion = (): CreateQuestionRequest => ({
    text: '',
    type: 'MULTIPLE_CHOICE',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    points: 1,
    explanation: ''
});

const EditExamPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const [activeStep, setActiveStep] = useState(0);
    const [exam, setExam] = useState<CreateExamRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchExam();
        } else {
            setExam({
                title: '',
                description: '',
                duration: 60,
                passingMarks: 40,
                status: 'DRAFT',
                startTime: undefined,
                endTime: undefined,
                questions: [getInitialQuestion()]
            });
            setLoading(false);
        }
    }, [id]);

    const fetchExam = async () => {
        try {
            setLoading(true);
            const response = await examAPI.getTeacherExamById(parseInt(id!));

            let examData = response;
            if (response && response.data) {
                examData = response.data;
            }

            const transformedExam: CreateExamRequest = {
                title: examData.title,
                description: examData.description,
                duration: examData.duration,
                passingMarks: examData.passingMarks,
                status: examData.status || 'DRAFT',
                startTime: examData.startTime || undefined,
                endTime: examData.endTime || undefined,
                questions: examData.questions?.map((q: any) => ({
                    text: q.text,
                    type: q.type,
                    option1: q.option1 || '',
                    option2: q.option2 || '',
                    option3: q.option3 || '',
                    option4: q.option4 || '',
                    correctAnswer: q.correctAnswer,
                    points: q.points,
                    explanation: q.explanation || ''
                })) || []
            };

            console.log('Transformed Exam:', transformedExam);
            setExam(transformedExam);
        } catch (err: any) {
            console.error('Error details:', err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch exam');
        } finally {
            setLoading(false);
        }
    };

    const handleExamChange = (field: keyof CreateExamRequest, value: any) => {
        if (exam) {
            setExam({...exam, [field]: value});
        }
    };

    const handleQuestionChange = (index: number, field: keyof CreateQuestionRequest, value: any) => {
        if (exam) {
            const updatedQuestions = [...exam.questions];
            updatedQuestions[index] = {...updatedQuestions[index], [field]: value};

            if (field === 'type' && (value === 'SHORT_ANSWER' || value === 'TRUE_FALSE')) {
                updatedQuestions[index].option1 = '';
                updatedQuestions[index].option2 = '';
                updatedQuestions[index].option3 = '';
                updatedQuestions[index].option4 = '';
            }

            setExam({...exam, questions: updatedQuestions});
        }
    };

    const addQuestion = () => {
        if (exam) {
            setExam({
                ...exam,
                questions: [...exam.questions, getInitialQuestion()]
            });
        }
    };

    const duplicateQuestion = (index: number) => {
        if (exam) {
            const questionToDuplicate = {...exam.questions[index]};
            const updatedQuestions = [...exam.questions];
            updatedQuestions.splice(index + 1, 0, {...questionToDuplicate, text: `${questionToDuplicate.text} (Copy)`});
            setExam({...exam, questions: updatedQuestions});
        }
    };

    const removeQuestion = (index: number) => {
        if (exam && exam.questions.length > 1) {
            const updatedQuestions = exam.questions.filter((_, i) => i !== index);
            setExam({...exam, questions: updatedQuestions});
        } else if (exam) {
            setError('Exam must have at least one question');
        }
    };

    const handleOptionChange = (questionIndex: number, optionNum: keyof CreateQuestionRequest, value: string) => {
        if (exam) {
            const updatedQuestions = [...exam.questions];
            updatedQuestions[questionIndex] = {
                ...updatedQuestions[questionIndex],
                [optionNum]: value
            };
            setExam({...exam, questions: updatedQuestions});
        }
    };

    const handleNext = () => {
        if (!exam) return;

        if (activeStep === 0) {
            if (!exam.title.trim()) {
                setError('Exam title is required');
                return;
            }
            if (!exam.description.trim()) {
                setError('Exam description is required');
                return;
            }
            if (exam.duration < 1) {
                setError('Duration must be at least 1 minute');
                return;
            }
            if (exam.passingMarks < 1) {
                setError('Passing marks must be at least 1');
                return;
            }
        } else if (activeStep === 1) {
            for (let i = 0; i < exam.questions.length; i++) {
                const q = exam.questions[i];
                if (!q.text.trim()) {
                    setError(`Question ${i + 1}: Text is required`);
                    return;
                }
                if (q.points < 1) {
                    setError(`Question ${i + 1}: Points must be at least 1`);
                    return;
                }
                if (!q.correctAnswer.trim()) {
                    setError(`Question ${i + 1}: Correct answer is required`);
                    return;
                }

                if (q.type === 'MULTIPLE_CHOICE') {
                    const options = [q.option1, q.option2, q.option3, q.option4].filter(opt => opt?.trim());
                    if (options.length < 2) {
                        setError(`Question ${i + 1}: At least two options are required for multiple choice`);
                        return;
                    }
                    if (!options.includes(q.correctAnswer.trim())) {
                        setError(`Question ${i + 1}: Correct answer must match one of the options`);
                        return;
                    }
                }
            }
        }

        setError(null);
        setActiveStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError(null);
        setActiveStep(prev => prev - 1);
    };

    const handleSave = async (status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED') => {
        if (!exam) return;

        try {
            if (status === 'PUBLISHED') {
                setPublishing(true);
            } else {
                setSaving(true);
            }

            setError(null);

            const examToSave = {
                ...exam,
                status
            };

            console.log('Sending data:', JSON.stringify(examToSave, null, 2));

            if (id) {
                await examAPI.updateExam(parseInt(id), examToSave);
            } else {
                await examAPI.createExam(examToSave);
            }

            alert(`Exam "${exam.title}" ${status === 'PUBLISHED' ? 'published' : 'saved'} successfully!`);
            navigate('/teacher/exams');

        } catch (err: any) {
            console.error('Full error:', err);
            console.error('Error response:', err.response?.data);
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save exam');
        } finally {
            setSaving(false);
            setPublishing(false);
        }
    };

    const calculateTotalMarks = () => {
        return exam ? exam.questions.reduce((total, q) => total + q.points, 0) : 0;
    };

    const getQuestionTypeLabel = (type: string) => {
        switch (type) {
            case 'MULTIPLE_CHOICE': return 'Multiple Choice';
            case 'TRUE_FALSE': return 'True/False';
            case 'SHORT_ANSWER': return 'Short Answer';
            default: return type;
        }
    };

    if (loading) {
        return (
            <Container sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
                <CircularProgress/>
            </Container>
        );
    }

    if (!exam) {
        return (
            <Container sx={{mt: 4}}>
                <Alert severity="error">Exam not found</Alert>
                <Button
                    startIcon={<ArrowBackIcon/>}
                    onClick={() => navigate('/teacher/exams')}
                    sx={{mt: 2}}
                >
                    Back to Exams
                </Button>
            </Container>
        );
    }

    // Format date for datetime-local input
    const formatDateForInput = (dateString: string | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    return (
        <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
            <Paper sx={{p: 3}}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                    <IconButton onClick={() => navigate('/teacher/exams')} sx={{mr: 2}}>
                        <ArrowBackIcon/>
                    </IconButton>
                    <Typography variant="h4">
                        {id ? 'Edit Exam' : 'Create Exam'}
                    </Typography>
                </Box>

                <Stepper activeStep={activeStep} sx={{mb: 4}}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}

                {activeStep === 0 && (
                    <Box>
                        <Grid container spacing={3}>
                            <Grid size={{xs: 12}}>
                                <TextField
                                    fullWidth
                                    label="Exam Title"
                                    value={exam.title}
                                    onChange={(e) => handleExamChange('title', e.target.value)}
                                    required
                                    helperText="Enter a descriptive title for the exam"
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={4}
                                    value={exam.description}
                                    onChange={(e) => handleExamChange('description', e.target.value)}
                                    required
                                    helperText="Provide instructions or details about the exam"
                                />
                            </Grid>
                            <Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    label="Duration (minutes)"
                                    type="number"
                                    value={exam.duration}
                                    onChange={(e) => handleExamChange('duration', parseInt(e.target.value) || 0)}
                                    required
                                    inputProps={{min: 1}}
                                    helperText="Total time allowed for the exam"
                                />
                            </Grid>
                            <Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    label="Passing Marks"
                                    type="number"
                                    value={exam.passingMarks}
                                    onChange={(e) => handleExamChange('passingMarks', parseInt(e.target.value) || 0)}
                                    required
                                    inputProps={{min: 1}}
                                    helperText="Minimum marks required to pass"
                                />
                            </Grid>
                            {/* ADD START TIME AND END TIME FIELDS */}
                            <Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    label="Start Time"
                                    type="datetime-local"
                                    value={formatDateForInput(exam.startTime)}
                                    onChange={(e) => handleExamChange('startTime', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                                    InputLabelProps={{shrink: true}}
                                    helperText="When the exam becomes available (optional)"
                                />
                            </Grid>
                            <Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    label="End Time"
                                    type="datetime-local"
                                    value={formatDateForInput(exam.endTime)}
                                    onChange={(e) => handleExamChange('endTime', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                                    InputLabelProps={{shrink: true}}
                                    helperText="When the exam closes (optional)"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                            <Box>
                                <Typography variant="h6">Questions ({exam.questions.length})</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Marks: {calculateTotalMarks()}
                                </Typography>
                            </Box>
                            <Box sx={{display: 'flex', gap: 2}}>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon/>}
                                    onClick={addQuestion}
                                >
                                    Add Question
                                </Button>
                            </Box>
                        </Box>

                        {exam.questions.map((question, qIndex) => (
                            <Paper key={qIndex} sx={{p: 3, mb: 3, position: 'relative', border: '1px solid', borderColor: 'primary.main'}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                        <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>
                                            Question {qIndex + 1}
                                        </Typography>
                                        <Chip
                                            label={getQuestionTypeLabel(question.type)}
                                            size="small"
                                            color="primary"
                                        />
                                        <Chip
                                            label={`${question.points} point${question.points !== 1 ? 's' : ''}`}
                                            size="small"
                                            color="secondary"
                                        />
                                    </Box>
                                    <Box>
                                        <Tooltip title="Duplicate Question">
                                            <IconButton
                                                size="small"
                                                onClick={() => duplicateQuestion(qIndex)}
                                                color="info"
                                            >
                                                <DuplicateIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Question">
                                            <IconButton
                                                size="small"
                                                onClick={() => removeQuestion(qIndex)}
                                                color="error"
                                                disabled={exam.questions.length <= 1}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid size={{xs: 12}}>
                                        <TextField
                                            fullWidth
                                            label="Question Text"
                                            multiline
                                            rows={2}
                                            value={question.text}
                                            onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                            required
                                            placeholder="Enter the question here..."
                                        />
                                    </Grid>

                                    <Grid size={{xs: 12, sm: 6}}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Question Type</InputLabel>
                                            <Select
                                                value={question.type}
                                                label="Question Type"
                                                onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                                            >
                                                <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
                                                <MenuItem value="TRUE_FALSE">True/False</MenuItem>
                                                <MenuItem value="SHORT_ANSWER">Short Answer</MenuItem>
                                            </Select>
                                            <FormHelperText>
                                                {question.type === 'MULTIPLE_CHOICE' && 'Select one correct answer from options'}
                                                {question.type === 'TRUE_FALSE' && 'Answer with True or False'}
                                                {question.type === 'SHORT_ANSWER' && 'Short written answer'}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{xs: 12, sm: 6}}>
                                        <TextField
                                            fullWidth
                                            label="Points"
                                            type="number"
                                            value={question.points}
                                            onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 1)}
                                            required
                                            inputProps={{min: 1, max: 100}}
                                            helperText="Marks for this question"
                                        />
                                    </Grid>

                                    {question.type === 'MULTIPLE_CHOICE' && (
                                        <Grid size={{xs: 12}}>
                                            <Divider sx={{my: 2}}/>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Options (Mark the correct one below)
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {[1, 2, 3, 4].map((num) => (
                                                    <Grid size={{xs: 12, sm: 6}} key={num}>
                                                        <TextField
                                                            fullWidth
                                                            label={`Option ${String.fromCharCode(64 + num)}`}
                                                            value={question[`option${num}` as keyof CreateQuestionRequest] || ''}
                                                            onChange={(e) => handleOptionChange(qIndex, `option${num}` as keyof CreateQuestionRequest, e.target.value)}
                                                            required
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Grid>
                                    )}

                                    <Grid size={{xs: 12}}>
                                        <Divider sx={{my: 2}}/>
                                        {question.type === 'MULTIPLE_CHOICE' ? (
                                            <FormControl component="fieldset" required>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Select Correct Option
                                                </Typography>
                                                <RadioGroup
                                                    value={question.correctAnswer}
                                                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                                    row
                                                >
                                                    {[1, 2, 3, 4].map((num) => {
                                                        const option = question[`option${num}` as keyof CreateQuestionRequest];
                                                        return option ? (
                                                            <FormControlLabel
                                                                key={num}
                                                                value={option}
                                                                control={<Radio/>}
                                                                label={`Option ${String.fromCharCode(64 + num)}`}
                                                            />
                                                        ) : null;
                                                    })}
                                                </RadioGroup>
                                                <FormHelperText>
                                                    Selected: {question.correctAnswer || 'None'}
                                                </FormHelperText>
                                            </FormControl>
                                        ) : question.type === 'TRUE_FALSE' ? (
                                            <FormControl component="fieldset" required>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Select Correct Answer
                                                </Typography>
                                                <RadioGroup
                                                    value={question.correctAnswer}
                                                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                                    row
                                                >
                                                    <FormControlLabel
                                                        value="true"
                                                        control={<Radio/>}
                                                        label="True"
                                                    />
                                                    <FormControlLabel
                                                        value="false"
                                                        control={<Radio/>}
                                                        label="False"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        ) : (
                                            <TextField
                                                fullWidth
                                                label="Correct Answer"
                                                value={question.correctAnswer}
                                                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                                required
                                                multiline
                                                rows={2}
                                                placeholder="Enter the correct answer..."
                                                helperText="This is what students' answers will be compared against"
                                            />
                                        )}
                                    </Grid>

                                    <Grid size={{xs: 12}}>
                                        <TextField
                                            fullWidth
                                            label="Explanation (Optional)"
                                            multiline
                                            rows={2}
                                            value={question.explanation || ''}
                                            onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                            placeholder="Provide explanation for the answer (visible in results)"
                                            helperText="Helps students understand why this answer is correct"
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}

                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon/>}
                                onClick={addQuestion}
                                size="large"
                            >
                                Add Another Question
                            </Button>
                        </Box>
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Review Exam</Typography>

                        <Paper sx={{p: 3, mb: 3}}>
                            <Typography variant="subtitle1" gutterBottom>Exam Details</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <Typography variant="body2" color="text.secondary">Title</Typography>
                                    <Typography variant="body1" sx={{fontWeight: 'medium'}}>{exam.title}</Typography>
                                </Grid>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                                    <Typography variant="body1">{exam.duration} minutes</Typography>
                                </Grid>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <Typography variant="body2" color="text.secondary">Passing Marks</Typography>
                                    <Typography variant="body1">{exam.passingMarks}</Typography>
                                </Grid>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <Typography variant="body2" color="text.secondary">Total Marks</Typography>
                                    <Typography variant="body1" sx={{fontWeight: 'medium'}}>{calculateTotalMarks()}</Typography>
                                </Grid>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <Typography variant="body2" color="text.secondary">Start Time</Typography>
                                    <Typography variant="body1">
                                        {exam.startTime ? new Date(exam.startTime).toLocaleString() : 'Immediately upon publishing'}
                                    </Typography>
                                </Grid>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <Typography variant="body2" color="text.secondary">End Time</Typography>
                                    <Typography variant="body1">
                                        {exam.endTime ? new Date(exam.endTime).toLocaleString() : 'No end time set'}
                                    </Typography>
                                </Grid>
                                <Grid size={{xs: 12}}>
                                    <Typography variant="body2" color="text.secondary">Description</Typography>
                                    <Typography variant="body1">{exam.description}</Typography>
                                </Grid>
                                <Grid size={{xs: 12}}>
                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                    <Chip
                                        label={exam.status || 'DRAFT'}
                                        color={exam.status === 'PUBLISHED' ? 'success' : 'warning'}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper sx={{p: 3}}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                                <Typography variant="subtitle1">Questions ({exam.questions.length})</Typography>
                                <Chip
                                    label={`${calculateTotalMarks()} Total Marks`}
                                    color="primary"
                                />
                            </Box>
                            {exam.questions.map((question, index) => (
                                <Box key={index} sx={{mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1}}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                        <Typography variant="body1" sx={{fontWeight: 'medium'}}>
                                            Q{index + 1}: {question.text}
                                        </Typography>
                                        <Box sx={{display: 'flex', gap: 1}}>
                                            <Chip
                                                label={getQuestionTypeLabel(question.type)}
                                                size="small"
                                                color="primary"
                                            />
                                            <Chip
                                                label={`${question.points} point${question.points !== 1 ? 's' : ''}`}
                                                size="small"
                                                color="secondary"
                                            />
                                        </Box>
                                    </Box>

                                    {question.type === 'MULTIPLE_CHOICE' && (
                                        <Box sx={{mt: 1}}>
                                            <Typography variant="body2" color="text.secondary">Options:</Typography>
                                            <Grid container spacing={1} sx={{mt: 0.5}}>
                                                {[1, 2, 3, 4].map((num) => {
                                                    const option = question[`option${num}` as keyof CreateQuestionRequest];
                                                    return option ? (
                                                        <Grid size={{xs: 12, sm: 6}} key={num}>
                                                            <Box
                                                                sx={{
                                                                    p: 1,
                                                                    bgcolor: question.correctAnswer === option ? 'success.light' : 'grey.100',
                                                                    borderRadius: 1,
                                                                    border: 1,
                                                                    borderColor: question.correctAnswer === option ? 'success.main' : 'transparent'
                                                                }}
                                                            >
                                                                <Typography variant="body2">
                                                                    {String.fromCharCode(64 + num)}. {option}
                                                                    {question.correctAnswer === option && ' ✓'}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    ) : null;
                                                })}
                                            </Grid>
                                        </Box>
                                    )}

                                    {question.type === 'TRUE_FALSE' && (
                                        <Box sx={{mt: 1}}>
                                            <Typography variant="body2">
                                                Correct Answer: <strong>{question.correctAnswer}</strong>
                                            </Typography>
                                        </Box>
                                    )}

                                    {question.type === 'SHORT_ANSWER' && (
                                        <Box sx={{mt: 1}}>
                                            <Typography variant="body2">
                                                Correct Answer: <strong>{question.correctAnswer}</strong>
                                            </Typography>
                                        </Box>
                                    )}

                                    {question.explanation && (
                                        <Box sx={{mt: 1}}>
                                            <Typography variant="body2" color="text.secondary">
                                                Explanation: {question.explanation}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Paper>
                    </Box>
                )}

                <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4}}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        startIcon={<ArrowBackIcon/>}
                    >
                        Back
                    </Button>
                    <Box sx={{display: 'flex', gap: 2}}>
                        {activeStep < steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                            >
                                Next
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<DraftIcon/>}
                                    onClick={() => handleSave('DRAFT')}
                                    disabled={saving || publishing}
                                >
                                    {saving ? 'Saving...' : 'Save as Draft'}
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<PublishIcon/>}
                                    onClick={() => handleSave('PUBLISHED')}
                                    disabled={saving || publishing || exam.status === 'PUBLISHED'}
                                >
                                    {publishing ? 'Publishing...' : 'Publish Exam'}
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default EditExamPage;
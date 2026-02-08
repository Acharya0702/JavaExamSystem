import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Chip,
    Button,
    IconButton,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Assignment as AssignmentIcon,
    BarChart as ChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../../api/exam';
import { Exam } from '../../types/exam.types';

const TeacherExamsPage: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            console.log('TeacherExamsPage - Token check:', token ? 'Present' : 'Missing');

            if (!token) {
                console.warn('No token found, redirecting to login');
                navigate('/login');
                return false;
            }
            return true;
        };

        if (!checkToken()) {
            return;
        }

        fetchExams();
    }, [navigate]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await examAPI.getTeacherExams();
            setExams(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch exams');
            console.error('Error fetching exams:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = () => {
        navigate('/teacher/exams/create');
    };

    const handleEditExam = (examId: number) => {
        navigate(`/teacher/exams/${examId}/edit`);
    };

    const handleViewExam = (examId: number) => {
        navigate(`/teacher/exams/${examId}/preview`);
    };

    const handleViewResults = (examId: number) => {
        navigate(`/teacher/exams/${examId}/results`);
    };

    const handleDeleteClick = (exam: Exam) => {
        setSelectedExam(exam);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedExam) return;

        try {
            await examAPI.deleteExam(selectedExam.id);
            setExams(exams.filter(exam => exam.id !== selectedExam.id));
            setDeleteDialogOpen(false);
            setSelectedExam(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete exam');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setSelectedExam(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'success';
            case 'DRAFT': return 'warning';
            case 'COMPLETED': return 'info';
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
                    <Typography variant="h4">
                        <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        My Exams
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateExam}
                    >
                        Create New Exam
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {exams.length === 0 ? (
                    <Alert severity="info">
                        No exams found. Create your first exam to get started.
                    </Alert>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="center">Duration</TableCell>
                                    <TableCell align="center">Questions</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Created</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {exams.map((exam) => (
                                    <TableRow key={exam.id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                {exam.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Marks: {exam.totalMarks} | Passing: {exam.passingMarks}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {exam.description.length > 60 ?
                                                    `${exam.description.substring(0, 60)}...` :
                                                    exam.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">{exam.duration} min</TableCell>
                                        <TableCell align="center">{exam.questionCount}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={exam.status}
                                                color={getStatusColor(exam.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {new Date(exam.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Tooltip title="View Results">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewResults(exam.id)}
                                                        color="info"
                                                    >
                                                        <ChartIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Preview Exam">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewExam(exam.id)}
                                                        color="primary"
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Exam">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditExam(exam.id)}
                                                        color="secondary"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Exam">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteClick(exam)}
                                                        color="error"
                                                        disabled={exam.status === 'PUBLISHED'}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Delete Exam</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete "{selectedExam?.title}"?
                    This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherExamsPage;
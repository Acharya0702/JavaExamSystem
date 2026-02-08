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
    Alert,
    CircularProgress
} from '@mui/material';
import {
    TrendingUp as ChartIcon,
    Assignment as AssignmentIcon,
    CheckCircle as PassIcon,
    Cancel as FailIcon,
    AccessTime as TimeIcon,
    Score as ScoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../../api/exam';
import { ExamResult } from '../../types/exam.types';

const AllResultsPage: React.FC = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await examAPI.getStudentResults();
            setResults(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch results');
            console.error('Error fetching results:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        return status === 'PASSED' ?
            <PassIcon color="success" /> :
            <FailIcon color="error" />;
    };

    const getStatusColor = (status: string) => {
        return status === 'PASSED' ? 'success' : 'error';
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

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">
                        <ChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        My Exam Results
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/student/exams')}
                    >
                        Back to Exams
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {results.length === 0 ? (
                    <Alert severity="info">
                        No results found. Take an exam to see your results here.
                    </Alert>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Exam</TableCell>
                                    <TableCell align="center">Score</TableCell>
                                    <TableCell align="center">Percentage</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Time Taken</TableCell>
                                    <TableCell align="center">Submitted</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((result) => (
                                    <TableRow key={result.id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle1">
                                                {result.examTitle}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="h6">
                                                {result.score}/{result.totalMarks}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ScoreIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                <Typography variant="h6">
                                                    {result.percentage.toFixed(1)}%
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                icon={getStatusIcon(result.status)}
                                                label={result.status}
                                                color={getStatusColor(result.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <TimeIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                                <Typography>
                                                    {formatTimeTaken(result.timeTaken)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            {new Date(result.submittedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate(`/student/results/${result.id}`)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
};

export default AllResultsPage;
// online-exam-frontend/src/pages/admin/AdminStatsPage.tsx
import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Alert,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ResponsiveContainer,
    PieLabelRenderProps // Add this import
} from 'recharts';
import {
    TrendingUp as TrendingUpIcon,
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    People as PeopleIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import axiosInstance from '../../config/axios';

interface Stats {
    totalUsers: number;
    students: number;
    teachers: number;
    admins: number;
    totalExams: number;
    completedExams: number;
    averageScore: number;
}

interface UserActivity {
    date: string;
    logins: number;
    registrations: number;
}

interface ExamStats {
    examTitle: string;
    averageScore: number;
    totalAttempts: number;
    passRate: number;
}

interface PieData {
    name: string;
    value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminStatsPage: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
    const [examStats, setExamStats] = useState<ExamStats[]>([]);
    const [timeRange, setTimeRange] = useState('week');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch basic stats
            const statsResponse = await axiosInstance.get('/admin/stats');
            setStats(statsResponse.data);

            // Mock data for charts (replace with actual API calls)
            setUserActivity([
                { date: 'Mon', logins: 65, registrations: 12 },
                { date: 'Tue', logins: 59, registrations: 8 },
                { date: 'Wed', logins: 80, registrations: 15 },
                { date: 'Thu', logins: 81, registrations: 10 },
                { date: 'Fri', logins: 56, registrations: 7 },
                { date: 'Sat', logins: 55, registrations: 5 },
                { date: 'Sun', logins: 40, registrations: 3 },
            ]);

            setExamStats([
                { examTitle: 'Java Fundamentals', averageScore: 78, totalAttempts: 45, passRate: 82 },
                { examTitle: 'Database Design', averageScore: 85, totalAttempts: 38, passRate: 89 },
                { examTitle: 'Web Development', averageScore: 72, totalAttempts: 52, passRate: 75 },
                { examTitle: 'Data Structures', averageScore: 68, totalAttempts: 29, passRate: 65 },
            ]);

        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch statistics');
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const userDistributionData: PieData[] = stats ? [
        { name: 'Students', value: stats.students },
        { name: 'Teachers', value: stats.teachers },
        { name: 'Admins', value: stats.admins },
    ] : [];

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
                    <Typography variant="h4">System Statistics</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Time Range</InputLabel>
                            <Select
                                value={timeRange}
                                label="Time Range"
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                <MenuItem value="day">Today</MenuItem>
                                <MenuItem value="week">This Week</MenuItem>
                                <MenuItem value="month">This Month</MenuItem>
                                <MenuItem value="year">This Year</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchStats}
                        >
                            Refresh
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {stats && (
                    <>
                        {/* Summary Cards */}
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
                                                    {stats.totalUsers}
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
                                                    Total Exams
                                                </Typography>
                                                <Typography variant="h4">
                                                    {stats.totalExams}
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
                                            <AssignmentIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                                            <Box>
                                                <Typography color="textSecondary" variant="body2">
                                                    Completed Exams
                                                </Typography>
                                                <Typography variant="h4">
                                                    {stats.completedExams}
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
                                            <TrendingUpIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                                            <Box>
                                                <Typography color="textSecondary" variant="body2">
                                                    Average Score
                                                </Typography>
                                                <Typography variant="h4">
                                                    {stats.averageScore}%
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Charts Row 1 */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid size={{xs:12, md:6}}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>User Activity</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={userActivity}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="logins" stroke="#8884d8" activeDot={{ r: 8 }} />
                                            <Line type="monotone" dataKey="registrations" stroke="#82ca9d" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                            <Grid size={{xs:12, md:6}}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>User Distribution</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={userDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(props: PieLabelRenderProps) => {
                                                    const { name, value } = props;
                                                    return `${name}: ${value}`;
                                                }}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {userDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Charts Row 2 */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid size={{xs:12}}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>Exam Performance</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={examStats}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="examTitle" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="averageScore" fill="#8884d8" name="Average Score (%)" />
                                            <Bar dataKey="passRate" fill="#82ca9d" name="Pass Rate (%)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Exam Stats Table */}
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Detailed Exam Statistics</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Exam Title</TableCell>
                                            <TableCell align="right">Average Score</TableCell>
                                            <TableCell align="right">Total Attempts</TableCell>
                                            <TableCell align="right">Pass Rate</TableCell>
                                            <TableCell width="200px">Performance</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {examStats.map((exam, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{exam.examTitle}</TableCell>
                                                <TableCell align="right">{exam.averageScore}%</TableCell>
                                                <TableCell align="right">{exam.totalAttempts}</TableCell>
                                                <TableCell align="right">{exam.passRate}%</TableCell>
                                                <TableCell>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={exam.averageScore}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 4,
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default AdminStatsPage;
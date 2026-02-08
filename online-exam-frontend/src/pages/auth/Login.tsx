// online-exam-frontend/src/pages/auth/Login.tsx
import React, {useState} from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {setCredentials} from '../../redux/slices/authSlice';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login response:', data);

                // FIX: Store token with correct key 'accessToken'
                localStorage.setItem('accessToken', data.token);

                // Also store with 'token' key for backward compatibility
                localStorage.setItem('token', data.token);

                localStorage.setItem('user', JSON.stringify({
                    id: data.id || 1,
                    username: data.username,
                    email: data.email,
                    fullName: data.fullName,
                    role: data.role,
                    enabled: true,
                }));

                // Dispatch to Redux
                dispatch(setCredentials({
                    user: {
                        id: data.id || 1,
                        username: data.username,
                        email: data.email,
                        fullName: data.fullName,
                        role: data.role,
                        enabled: true,
                    },
                    token: data.token,
                }));

                // Redirect based on role
                if (data.role === 'TEACHER') {
                    navigate('/teacher/dashboard');
                } else if (data.role === 'ADMIN') {
                    navigate('/admin/users');
                } else {
                    navigate('/dashboard');
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Login failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Network error. Please check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{mt: 8}}>
                <Paper elevation={3} sx={{p: 4}}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Login
                    </Typography>
                    {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24}/> : 'Sign In'}
                        </Button>
                        <Typography align="center">
                            Don't have an account? <a href="/register">Register here</a>
                        </Typography>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
import React, {useState} from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {setCredentials} from '../../redux/slices/authSlice';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student', // lowercase for frontend
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        // Add this at the beginning of handleSubmit or in useEffect
        const testBackend = async () => {
            try {
                const testResponse = await fetch('http://localhost:8080/auth/health', {
                    method: 'GET',
                });
                console.log('Backend health check:', testResponse.status, await testResponse.text());
            } catch (error) {
                console.error('Cannot reach backend:', error);
            }
        };
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('All fields are required');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                // In the handleSubmit method of Register.tsx, change the request body:
                body: JSON.stringify({
                    username: formData.email.split('@')[0], // Use email prefix as username
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.name,
                    role: formData.role.toUpperCase(), // Make sure it's uppercase
                }),
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const responseData = await response.json();
                console.log('Registration successful:', responseData);

                // Get user data from response
                const userData = responseData.user || responseData;
                const token = responseData.token || userData.token;

                // Create user object matching User type
                const user = {
                    id: userData.id || 1,
                    username: userData.username,
                    email: userData.email,
                    fullName: userData.fullName,  // Use fullName
                    role: userData.role,  // Keep uppercase
                    enabled: userData.enabled !== undefined ? userData.enabled : true,
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt,
                };

                dispatch(setCredentials({
                    user: user,
                    token: token,
                }));

                localStorage.setItem('accessToken', token);
                localStorage.setItem('user', JSON.stringify(user));  // Now 'user' exists!

                // Redirect (use uppercase role check)
                if (user.role === 'TEACHER') {
                    navigate('/teacher/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                const errorText = await response.text();
                console.error('Registration failed:', errorText);

                try {
                    const errorData = JSON.parse(errorText);
                    setError(errorData.message || errorData.error || `Registration failed (${response.status})`);
                } catch {
                    setError(`Registration failed (${response.status}): ${errorText}`);
                }
            }
        } catch (err: any) {
            console.error('Network error:', err);
            setError(`Network error: ${err.message || 'Please check backend connection'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{mt: 8}}>
                <Paper elevation={3} sx={{p: 4}}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Register
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Role"
                            name="role"
                            select
                            value={formData.role}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={loading}
                        >
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="teacher">Teacher</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                            {loading ? <CircularProgress size={24}/> : 'Register'}
                        </Button>
                        <Typography align="center">
                            Already have an account? <a href="/login">Login here</a>
                        </Typography>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;
// online-exam-frontend/src/pages/auth/LoginForm.tsx or Login.tsx
import React, { useState } from 'react';
import { login } from '../../api/auth';

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('🔐 Submitting login form...');
            const response = await login(username, password);

            console.log('✅ Login successful, response:', response);

            // Redirect based on role
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const role = user.role || response.role;

            switch (role?.toUpperCase()) {
                case 'ADMIN':
                    window.location.href = '/admin/dashboard';
                    break;
                case 'TEACHER':
                    window.location.href = '/teacher/dashboard';
                    break;
                case 'STUDENT':
                    window.location.href = '/student/dashboard';
                    break;
                default:
                    window.location.href = '/dashboard';
            }

        } catch (err: any) {
            console.error('❌ Login error:', err);
            setError(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Username/Email:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default LoginForm;
// online-exam-frontend/src/api/auth.ts
import axiosInstance from '../config/axios';

export const login = async (username: string, password: string) => {
    try {
        console.log('🔐 Attempting login for:', username);

        const response = await axiosInstance.post('/auth/login', {
            username: username,
            password: password
        });

        console.log('✅ Login response:', response.data);

        if (response.data.token) {
            // Store token
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('accessToken', response.data.token); // For compatibility

            // Store user info
            localStorage.setItem('user', JSON.stringify({
                username: response.data.username || username,
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                role: response.data.role
            }));

            console.log('✅ Token stored:', response.data.token.substring(0, 20) + '...');
        }

        return response.data;
    } catch (error: any) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        throw error;
    }
};

export const register = async (userData: any) => {
    try {
        console.log('📝 Attempting registration for:', userData.email);

        const response = await axiosInstance.post('/auth/register', userData);

        console.log('✅ Registration response:', response.data);

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('accessToken', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                username: response.data.username,
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                role: response.data.role
            }));
        }

        return response.data;
    } catch (error: any) {
        console.error('❌ Registration failed:', error.response?.data || error.message);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.location.href = '/login';
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('accessToken');
};

export const isAuthenticated = () => {
    return !!getToken();
};
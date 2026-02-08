// online-exam-frontend/src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/auth.types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

// FIX: Check both 'accessToken' and 'token' keys
const getToken = () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

const initialState: AuthState = {
    user: getUser(),
    token: getToken(), // Use the helper function
    isAuthenticated: !!getToken(), // Check if any token exists
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = {
                id: action.payload.user.id,
                username: action.payload.user.username,
                email: action.payload.user.email,
                fullName: action.payload.user.fullName,
                role: action.payload.user.role,
                enabled: action.payload.user.enabled,
                createdAt: action.payload.user.createdAt,
                updatedAt: action.payload.user.updatedAt,
            };
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;

            // FIX: Store token with both keys
            localStorage.setItem('accessToken', action.payload.token);
            localStorage.setItem('token', action.payload.token); // For compatibility
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;

            // FIX: Remove both token keys
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
    },
});

export const {
    setCredentials,
    setLoading,
    setError,
    logout,
    clearError,
    updateUser
} = authSlice.actions;

export default authSlice.reducer;
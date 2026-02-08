// online-exam-frontend/src/components/common/NavigateToDashboard.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { CircularProgress, Box } from '@mui/material';

const NavigateToDashboard: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    // If not authenticated, go to login
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If still loading or user not loaded
    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Redirect based on role
    switch (user.role) {
        case 'TEACHER':
            return <Navigate to="/teacher/dashboard" />;
        case 'ADMIN':
            return <Navigate to="/admin/dashboard" />;
        case 'STUDENT':
        default:
            return <Navigate to="/dashboard" />;
    }
};

export default NavigateToDashboard;
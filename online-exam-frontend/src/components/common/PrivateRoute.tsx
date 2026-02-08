// online-exam-frontend/src/components/common/PrivateRoute.tsx
import React from 'react';
import {Navigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';

interface PrivateRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({children, allowedRoles}) => {
    const {isAuthenticated, user} = useSelector((state: RootState) => state.auth);

    // Additional check: verify token exists in localStorage
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const hasToken = !!token;

    if (!isAuthenticated || !hasToken) {
        console.log('PrivateRoute: Not authenticated or no token');
        return <Navigate to="/login"/>;
    }

    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
        console.log(`PrivateRoute: User role ${user.role} not in allowed roles`, allowedRoles);
        // Redirect to appropriate dashboard based on role
        if (user.role === 'TEACHER') {
            return <Navigate to="/teacher/dashboard"/>;
        } else if (user.role === 'ADMIN') {
            return <Navigate to="/admin/dashboard"/>;
        }
        return <Navigate to="/dashboard"/>;
    }

    return <>{children}</>;
};

export default PrivateRoute;
// App.tsx - Updated with correct routes
import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {Provider} from 'react-redux';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './redux/store';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import PrivateRoute from './components/common/PrivateRoute';
import StudentExamsPage from './pages/student/ExamsPage';
import TakeExamPage from './pages/student/TakeExamPage';
import CreateExamPage from './pages/teacher/CreateExamPage';
import UsersPage from './pages/admin/UsersPage';
import NavigateToDashboard from "./components/common/NavigateToDashboard";
import AllResultsPage from "./pages/student/AllResultsPage";
import EditExamPage from "./pages/teacher/EditExamPage";
import TeacherExamsPage from "./pages/teacher/TeacherExamsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminStatsPage from "./pages/admin/AdminStatsPage";
import ProfilePage from "./components/common/ProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SingleResultPage from "./pages/student/SingleResultPage";

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <Router>
                    <Routes>
                        {/* Public routes - NO Layout */}
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>

                        {/* Protected routes with Layout */}
                        <Route path="/" element={
                            <PrivateRoute>
                                <Layout/>
                            </PrivateRoute>
                        }>
                            {/* Dashboard routes */}
                            <Route path="dashboard" element={<StudentDashboard/>}/>
                            <Route path="teacher/dashboard" element={<TeacherDashboard/>}/>
                            <Route path="admin/dashboard" element={<AdminDashboard/>}/>

                            {/* Student routes */}
                            <Route path="exams" element={<StudentExamsPage/>}/>
                            <Route path="exam/:id" element={<TakeExamPage/>}/>
                            <Route path="results/:resultId" element={<SingleResultPage/>}/>  {/* Single result */}
                            <Route path="results" element={<AllResultsPage/>}/>  {/* All results */}

                            {/* Teacher routes */}
                            <Route path="teacher/exams" element={<TeacherExamsPage/>}/>
                            <Route path="teacher/exams/create" element={<CreateExamPage/>}/>
                            <Route path="teacher/exams/:id/edit" element={<EditExamPage/>}/>

                            {/* Admin routes */}
                            <Route path="admin/users" element={<UsersPage/>}/>
                            <Route path="admin/stats" element={<AdminStatsPage/>}/>
                            <Route path="admin/settings" element={<AdminSettingsPage/>}/>

                            {/* Profile */}
                            <Route path="profile" element={<ProfilePage/>}/>

                            {/* Default redirect based on role */}
                            <Route index element={<NavigateToDashboard/>}/>
                        </Route>

                        {/* Catch-all route */}
                        <Route path="*" element={<Navigate to="/login"/>}/>
                    </Routes>
                </Router>
            </ThemeProvider>
        </Provider>
    );
};

export default App;
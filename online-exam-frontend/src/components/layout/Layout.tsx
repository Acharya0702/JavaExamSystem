// online-exam-frontend/src/components/layout/Layout.tsx
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    ExitToApp as LogoutIcon,
    Menu as MenuIcon,
    AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

interface NavigationItem {
    text: string;
    icon: React.ReactNode;
    path: string;
}

const Layout: React.FC = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Navigation items based on role
    const getNavigationItems = (): NavigationItem[] => {
        const baseItems: NavigationItem[] = [
            {
                text: 'Dashboard',
                icon: <DashboardIcon />,
                path: user?.role === 'TEACHER' ? '/teacher/dashboard' :
                    user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard',
            },
            {
                text: 'Profile',
                icon: <PeopleIcon />,
                path: '/profile',
            },
        ];

        if (user?.role === 'STUDENT') {
            baseItems.push(
                {
                    text: 'Exams',
                    icon: <AssignmentIcon />,
                    path: '/exams',
                },
                {
                    text: 'Results',
                    icon: <SchoolIcon />,
                    path: '/results',
                }
            );
        }

        if (user?.role === 'TEACHER') {
            baseItems.push(
                {
                    text: 'Create Exam',
                    icon: <AssignmentIcon />,
                    path: '/teacher/exams/create',
                },
                {
                    text: 'My Exams',
                    icon: <SchoolIcon />,
                    path: '/teacher/exams',
                }
            );
        }

        if (user?.role === 'ADMIN') {
            baseItems.push(
                {
                    text: 'User Management',
                    icon: <AdminIcon />,
                    path: '/admin/users',
                },
                {
                    text: 'System Stats',
                    icon: <SchoolIcon />,
                    path: '/admin/stats',
                }
            );
        }

        return baseItems;
    };

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap>
                    Exam System
                </Typography>
            </Toolbar>
            <List>
                {getNavigationItems().map((item) => (
                    <ListItem
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            setMobileOpen(false);
                        }}
                        sx={{
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <ListItem
                    onClick={handleLogout}
                    sx={{
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }}
                >
                    <ListItemIcon>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Welcome, {user?.fullName || user?.username} ({user?.role})
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar />
                <Container maxWidth="lg">
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;
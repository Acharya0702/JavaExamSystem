// online-exam-frontend/src/pages/common/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    Avatar,
    Alert,
    Divider,
    Tabs,
    Tab,
    CircularProgress,
    Snackbar,
    Card,
    CardContent
} from '@mui/material';
import {
    Save as SaveIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import axiosInstance from '../../config/axios';

interface ProfileData {
    username: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const ProfilePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState(0);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setProfile({
                username: user.username || '',
                email: user.email || '',
                fullName: user.fullName || '',
                role: user.role || '',
                createdAt: user.createdAt || new Date().toISOString()
            });
        }
    }, [user]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setError(null);
        setSuccess(null);
    };

    const handleProfileChange = (field: keyof ProfileData, value: string) => {
        if (profile) {
            setProfile({ ...profile, [field]: value });
        }
    };

    const handlePasswordChange = (field: keyof PasswordData, value: string) => {
        setPasswordData({ ...passwordData, [field]: value });
    };

    const handleSaveProfile = async () => {
        if (!profile) return;

        try {
            setSaving(true);
            setError(null);

            await axiosInstance.put('/user/profile', {
                fullName: profile.fullName,
                email: profile.email
            });

            setSuccess('Profile updated successfully');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await axiosInstance.put('/user/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setSuccess('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const getRoleDisplay = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Administrator';
            case 'TEACHER': return 'Teacher';
            case 'STUDENT': return 'Student';
            default: return role;
        }
    };

    if (!profile) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    My Profile
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        sx={{ width: 100, height: 100, mr: 3 }}
                        alt={profile.fullName}
                    >
                        {profile.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h5">{profile.fullName}</Typography>
                        <Typography color="text.secondary">
                            <EmailIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                            {profile.email}
                        </Typography>
                        <Typography color="text.secondary">
                            <SchoolIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                            {getRoleDisplay(profile.role)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Member since {new Date(profile.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>

                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab icon={<PersonIcon />} label="Profile Information" />
                    <Tab icon={<LockIcon />} label="Change Password" />
                </Tabs>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Snackbar
                    open={!!success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess(null)}
                    message={success}
                />

                {activeTab === 0 && (
                    <Box>
                        <Grid container spacing={3}>
                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    value={profile.username}
                                    disabled
                                    helperText="Username cannot be changed"
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => handleProfileChange('email', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{xs:12}}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={profile.fullName}
                                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    fullWidth
                                    label="Role"
                                    value={getRoleDisplay(profile.role)}
                                    disabled
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    fullWidth
                                    label="Member Since"
                                    value={new Date(profile.createdAt).toLocaleDateString()}
                                    disabled
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                            <Button
                                variant="contained"
                                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                onClick={handleSaveProfile}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Password Requirements
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • At least 6 characters long<br />
                                    • Include uppercase and lowercase letters<br />
                                    • Include at least one number
                                </Typography>
                            </CardContent>
                        </Card>

                        <Grid container spacing={3}>
                            <Grid size={{xs:12}}>
                                <TextField
                                    fullWidth
                                    label="Current Password"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    required
                                    error={passwordData.newPassword !== passwordData.confirmPassword}
                                    helperText={
                                        passwordData.newPassword !== passwordData.confirmPassword
                                            ? 'Passwords do not match'
                                            : ''
                                    }
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                            <Button
                                variant="contained"
                                startIcon={saving ? <CircularProgress size={20} /> : <LockIcon />}
                                onClick={handleChangePassword}
                                disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                            >
                                {saving ? 'Changing...' : 'Change Password'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default ProfilePage;
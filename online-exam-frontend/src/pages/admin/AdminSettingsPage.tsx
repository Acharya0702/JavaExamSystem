// online-exam-frontend/src/pages/admin/AdminSettingsPage.tsx
import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Grid,
    Switch,
    FormControlLabel,
    Divider,
    Card,
    CardContent,
    Snackbar,
    CircularProgress
} from '@mui/material';
import {
    Save as SaveIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    SystemUpdate as SystemIcon,
    Backup as BackupIcon
} from '@mui/icons-material';
import axiosInstance from '../../config/axios';

interface SystemSettings {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    supportEmail: string;
    maxFileSize: number;
    sessionTimeout: number;
}

interface SecuritySettings {
    requireEmailVerification: boolean;
    enableTwoFactorAuth: boolean;
    maxLoginAttempts: number;
    passwordMinLength: number;
    passwordRequireNumbers: boolean;
    passwordRequireSymbols: boolean;
}

interface NotificationSettings {
    emailNotifications: boolean;
    examNotifications: boolean;
    userNotifications: boolean;
    systemNotifications: boolean;
}

const AdminSettingsPage: React.FC = () => {
    const [systemSettings, setSystemSettings] = useState<SystemSettings>({
        siteName: 'Online Exam System',
        siteUrl: 'http://localhost:3000',
        adminEmail: 'admin@examsystem.com',
        supportEmail: 'support@examsystem.com',
        maxFileSize: 10,
        sessionTimeout: 30
    });

    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        requireEmailVerification: true,
        enableTwoFactorAuth: false,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        passwordRequireNumbers: true,
        passwordRequireSymbols: true
    });

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        emailNotifications: true,
        examNotifications: true,
        userNotifications: true,
        systemNotifications: true
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSystemChange = (field: keyof SystemSettings, value: any) => {
        setSystemSettings({ ...systemSettings, [field]: value });
    };

    const handleSecurityChange = (field: keyof SecuritySettings, value: any) => {
        setSecuritySettings({ ...securitySettings, [field]: value });
    };

    const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
        setNotificationSettings({ ...notificationSettings, [field]: value });
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            setError(null);

            // In a real app, you would send each settings group to different endpoints
            await Promise.all([
                axiosInstance.post('/admin/settings/system', systemSettings),
                axiosInstance.post('/admin/settings/security', securitySettings),
                axiosInstance.post('/admin/settings/notifications', notificationSettings)
            ]);

            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save settings');
            console.error('Error saving settings:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleBackup = async () => {
        try {
            // Backup functionality
            alert('Backup feature would be implemented here');
        } catch (error) {
            console.error('Backup failed:', error);
        }
    };

    const handleSystemUpdate = async () => {
        try {
            // System update functionality
            alert('System update feature would be implemented here');
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    System Settings
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Snackbar
                    open={success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess(false)}
                    message="Settings saved successfully"
                />

                <Grid container spacing={3}>
                    {/* System Settings */}
                    <Grid size={{xs:12}}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <SystemIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6">System Settings</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{xs:12, sm:6}}>
                                        <TextField
                                            fullWidth
                                            label="Site Name"
                                            value={systemSettings.siteName}
                                            onChange={(e) => handleSystemChange('siteName', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <TextField
                                            fullWidth
                                            label="Site URL"
                                            value={systemSettings.siteUrl}
                                            onChange={(e) => handleSystemChange('siteUrl', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <TextField
                                            fullWidth
                                            label="Admin Email"
                                            type="email"
                                            value={systemSettings.adminEmail}
                                            onChange={(e) => handleSystemChange('adminEmail', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <TextField
                                            fullWidth
                                            label="Support Email"
                                            type="email"
                                            value={systemSettings.supportEmail}
                                            onChange={(e) => handleSystemChange('supportEmail', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <TextField
                                            fullWidth
                                            label="Max File Size (MB)"
                                            type="number"
                                            value={systemSettings.maxFileSize}
                                            onChange={(e) => handleSystemChange('maxFileSize', parseInt(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <TextField
                                            fullWidth
                                            label="Session Timeout (minutes)"
                                            type="number"
                                            value={systemSettings.sessionTimeout}
                                            onChange={(e) => handleSystemChange('sessionTimeout', parseInt(e.target.value))}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Security Settings */}
                    <Grid size={{xs:12}}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <SecurityIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6">Security Settings</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{xs:12, sm:6}}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={securitySettings.requireEmailVerification}
                                                    onChange={(e) => handleSecurityChange('requireEmailVerification', e.target.checked)}
                                                />
                                            }
                                            label="Require Email Verification"
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={securitySettings.enableTwoFactorAuth}
                                                    onChange={(e) => handleSecurityChange('enableTwoFactorAuth', e.target.checked)}
                                                />
                                            }
                                            label="Enable Two-Factor Authentication"
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <TextField
                                            fullWidth
                                            label="Max Login Attempts"
                                            type="number"
                                            value={securitySettings.maxLoginAttempts}
                                            onChange={(e) => handleSecurityChange('maxLoginAttempts', parseInt(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <TextField
                                            fullWidth
                                            label="Minimum Password Length"
                                            type="number"
                                            value={securitySettings.passwordMinLength}
                                            onChange={(e) => handleSecurityChange('passwordMinLength', parseInt(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={securitySettings.passwordRequireNumbers}
                                                    onChange={(e) => handleSecurityChange('passwordRequireNumbers', e.target.checked)}
                                                />
                                            }
                                            label="Require Numbers in Password"
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={securitySettings.passwordRequireSymbols}
                                                    onChange={(e) => handleSecurityChange('passwordRequireSymbols', e.target.checked)}
                                                />
                                            }
                                            label="Require Symbols in Password"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Notification Settings */}
                    <Grid size={{xs:12}}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <NotificationsIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6">Notification Settings</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{xs:12, sm:6}}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={notificationSettings.emailNotifications}
                                                    onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                                                />
                                            }
                                            label="Email Notifications"
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={notificationSettings.examNotifications}
                                                    onChange={(e) => handleNotificationChange('examNotifications', e.target.checked)}
                                                />
                                            }
                                            label="Exam Notifications"
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={notificationSettings.userNotifications}
                                                    onChange={(e) => handleNotificationChange('userNotifications', e.target.checked)}
                                                />
                                            }
                                            label="User Notifications"
                                        />
                                    </Grid>
                                    <Grid size={{xs:12, sm:6}}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={notificationSettings.systemNotifications}
                                                    onChange={(e) => handleNotificationChange('systemNotifications', e.target.checked)}
                                                />
                                            }
                                            label="System Notifications"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* System Actions */}
                <Grid container spacing={2}>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<BackupIcon />}
                            onClick={handleBackup}
                        >
                            Backup System
                        </Button>
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<SystemIcon />}
                            onClick={handleSystemUpdate}
                        >
                            Check for Updates
                        </Button>
                    </Grid>
                    <Grid size={{xs:12, sm:12, md:6}}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    // Reset to defaults
                                    setSystemSettings({
                                        siteName: 'Online Exam System',
                                        siteUrl: 'http://localhost:3000',
                                        adminEmail: 'admin@examsystem.com',
                                        supportEmail: 'support@examsystem.com',
                                        maxFileSize: 10,
                                        sessionTimeout: 30
                                    });
                                    setSecuritySettings({
                                        requireEmailVerification: true,
                                        enableTwoFactorAuth: false,
                                        maxLoginAttempts: 5,
                                        passwordMinLength: 8,
                                        passwordRequireNumbers: true,
                                        passwordRequireSymbols: true
                                    });
                                    setNotificationSettings({
                                        emailNotifications: true,
                                        examNotifications: true,
                                        userNotifications: true,
                                        systemNotifications: true
                                    });
                                }}
                            >
                                Reset to Defaults
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                onClick={handleSaveSettings}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save All Settings'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default AdminSettingsPage;
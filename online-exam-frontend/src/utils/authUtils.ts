// online-exam-frontend/src/utils/authUtils.ts
export const cleanupTokens = () => {
    // Remove all possible token keys
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

export const getToken = () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

export const setToken = (token: string) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('token', token); // For compatibility
};

export const isAuthenticated = () => {
    return !!getToken();
};
// client/src/services/authService.js

import api from './api';

// ----------------------------
// LOGIN FUNCTION
// ----------------------------
const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });

        if (response.data.success && response.data.token && response.data.user) {
            const { token, user } = response.data;

            // Enforce structure → avoids "Admin User" bug
            const fullUser = {
                username: user.username,
                role: user.role,
                id: user.id || null
            };

            // Save token + user object
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(fullUser));

            return fullUser;
        }

        return null;

    } catch (error) {
        console.error("Login API Error:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// ----------------------------
// LOGOUT FUNCTION
// ----------------------------
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// ----------------------------
// LOAD CURRENT USER
// ----------------------------
const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// ----------------------------
// DASHBOARD DATA (SINGLE API)
// ----------------------------
const getDashboardData = async () => {
    try {
        const response = await api.get('/dashboard');
        return response.data.data;
    } catch (error) {
        console.error("Dashboard Load Error:", error);
        throw error;
    }
};

// ----------------------------
// EXPORT SERVICE
// ----------------------------
const AuthService = {
    login,
    logout,
    getCurrentUser,
    getDashboardData
};

export default AuthService;

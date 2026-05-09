import axios from 'axios';
import { Platform } from 'react-native';

const PORT = '8073';

const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        return `http://10.0.2.2:${PORT}`;
    }
    return `http://localhost:${PORT}`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Module-level token store — set this after login
let _authToken = null;
export const setAuthToken = (t) => { _authToken = t; };
export const clearAuthToken = () => { _authToken = null; };

// Attach token to every request if available
api.interceptors.request.use((config) => {
    if (_authToken) {
        config.headers['Authorization'] = `Bearer ${_authToken}`;
    }
    return config;
});

export default api;

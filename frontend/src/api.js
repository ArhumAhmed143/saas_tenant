import axios from 'axios';

// ============================================
// Backend URL Configuration
// ============================================
// Production (Render/Vercel): REACT_APP_API_URL environment variable se aayega
// Local development: http://localhost:5000 (fallback)
const RAW_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = RAW_URL.replace(/\/api\/?$/, '');

// ============================================
// Axios Instance
// ============================================
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Request Interceptor
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// Response Interceptor
// ============================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
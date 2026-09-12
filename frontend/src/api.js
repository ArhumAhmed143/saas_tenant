import axios from 'axios';

// ============================================
// Backend URL Configuration
// ============================================
// Production (Render/Vercel): REACT_APP_API_URL environment variable se aayega
// Local development: http://localhost:5000 (fallback)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ============================================
// Axios Instance
// ============================================
// Saari API calls isi instance ko use karengi
// baseURL automatically prepend hoga har request mein
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Cookies/session bhejne ke liye (Passport OAuth ke liye zaroori)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Request Interceptor
// ============================================
// JWT token localStorage se utha kar automatically bhejega
api.interceptors.request.use(
  (config) => {
    // ✅ 'accessToken' use karein (AppContext.js ke saath match)
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
// Agar token expire ho jaye (401) to user ko logout kar dega
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expire - logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Agar login page pe nahi hain to redirect
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
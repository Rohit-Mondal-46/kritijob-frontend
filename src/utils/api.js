import axios from 'axios';
import safeStorage from './safeStorage';

const apiBaseURL = import.meta.env.VITE_API_URL || 'https://api.kirtijob.com/api/';

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = safeStorage.getItem('token');
    const hasAuthHeader = Boolean(
      config.headers?.Authorization ||
      config.headers?.authorization ||
      (typeof config.headers?.get === 'function' && config.headers.get('Authorization')),
    );

    // Preserve per-request auth headers (used by payment callback/verification flows).
    if (token && !hasAuthHeader) {
      if (!config.headers) config.headers = {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (Token expired/invalid)
    if (error.response && error.response.status === 401) {
        const isPaymentRoute = window.location.pathname.startsWith('/payment');
        const skipAuthReset = Boolean(error.config?.skipAuthResetOn401);

        // Optional: Implement refresh token logic here if needed
        // For now, just clear storage and redirect to login if it's a hard auth failure
        // But be careful not to redirect on login failure itself
        if (!window.location.pathname.startsWith('/auth') && !isPaymentRoute && !skipAuthReset) {
             safeStorage.removeItem('token');
             safeStorage.removeItem('user');
             // window.location.href = '/login'; 
        }
    }
    return Promise.reject(error);
  }
);

export default api;

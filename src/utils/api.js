import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://kriti-job-backend.vercel.app/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    'Connection': 'keep-alive'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
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
        // Optional: Implement refresh token logic here if needed
        // For now, just clear storage and redirect to login if it's a hard auth failure
        // But be careful not to redirect on login failure itself
        if (!window.location.pathname.startsWith('/auth')) {
             localStorage.removeItem('token');
             localStorage.removeItem('user');
             // window.location.href = '/login'; 
        }
    }
    return Promise.reject(error.response ? error.response.data : { message: 'Network Error' });
  }
);

export default api;

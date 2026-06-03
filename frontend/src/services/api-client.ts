import axios from 'axios';

// Purpose: Central API client configured with global baseURL, timeouts, and auth headers interceptors.

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://inventory-order-management-system-uvze.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor for JWT injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for handling expired or invalid JWT sessions globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Avoid redirect loops if the login/signup calls themselves fail with 401
      const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/signup');
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

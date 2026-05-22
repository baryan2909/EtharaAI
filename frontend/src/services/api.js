import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 
    (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token into requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to extract clean error messages from response
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'An unexpected error occurred. Please try again.';
    
    // Create a normalized error object to propagate
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    normalizedError.data = error.response?.data;
    
    return Promise.reject(normalizedError);
  }
);

export default API;

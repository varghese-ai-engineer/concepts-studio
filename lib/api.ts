import axios from 'axios';
import { getToken, logout } from './auth';

// Frontend and backend are always served from the same origin via the
// Nginx reverse proxy (/ -> frontend, /api/* -> backend), so requests use
// relative paths and need no base URL.
const api = axios.create();

// Request interceptor to automatically add Authorization, Timezone, and CSRF headers.
// The CSRF token is required by the backend on all state-changing methods in production.
// It is set as a cookie by the backend on the first GET request and must be echoed
// back in the x-csrf-token header. Without it, every POST/PATCH/PUT/DELETE returns 403.
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof window !== 'undefined' && config.headers) {
      config.headers['x-timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const csrfMatch = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
      if (csrfMatch?.[1]) {
        config.headers['x-csrf-token'] = decodeURIComponent(csrfMatch[1]);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to intercept 401 unauthorized errors and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;

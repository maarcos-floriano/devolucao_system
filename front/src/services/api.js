import axios from 'axios';

const getDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://localhost:3001/api';
  }

  return '/api';
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || getDefaultApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.role) {
          config.headers['X-User-Role'] = user.role;
        }
      } catch (error) {
        localStorage.removeItem('user');
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;

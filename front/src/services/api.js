import axios from 'axios';

// Em produção (Render), prefira URL relativa para evitar hardcode de IP/localhost.
// Se REACT_APP_API_URL estiver definida, ela terá prioridade.
const resolveApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  // Fallback seguro para web app e API no mesmo domínio.
  return '/api';
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token às requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

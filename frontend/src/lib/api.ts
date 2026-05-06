import axios, { AxiosError } from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').trim();

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — añade JWT automáticamente
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('portico_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string; error: string }>) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config && error.config.url && error.config.url.includes('/auth/');
      if (!isAuthRoute && typeof window !== 'undefined') {
        localStorage.removeItem('portico_token');
        localStorage.removeItem('portico_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper para extraer mensajes de error amigables
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<{ message: string | string[] }>).response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    if (error.code === 'ECONNABORTED') return 'La conexión tardó demasiado. Inténtalo de nuevo.';
    if (!error.response) return 'Sin conexión. Revisa tu internet.';
    if (error.response.status === 502) return 'No pudimos conectar con el servidor. Inténtalo más tarde.';
    if (error.response.status >= 500) return 'Algo salió mal de nuestro lado. Inténtalo de nuevo.';
  }
  return 'Ocurrió un error inesperado.';
}

export default api;

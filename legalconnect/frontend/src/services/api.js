import axios from 'axios';

export const TOKEN_KEY = 'lc_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isCredentialCall = url.includes('/auth/login') || url.includes('/auth/register');
    if (err.response?.status === 401 && !isCredentialCall) {
      // Session expired or revoked: clear it and let the auth context react
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(err);
  }
);

// Turns any axios error into { message, fieldErrors } for forms and toasts
export function parseApiError(err) {
  if (err.code === 'ECONNABORTED') return { message: 'The server took too long to respond. Try again.', fieldErrors: {} };
  if (!err.response) return { message: 'Cannot reach the server. Check your connection and try again.', fieldErrors: {} };
  const { message, errors } = err.response.data || {};
  const fieldErrors = {};
  (errors || []).forEach((e) => {
    if (e.path && !fieldErrors[e.path]) fieldErrors[e.path] = e.message;
  });
  return { message: message || 'Something went wrong. Try again.', fieldErrors };
}

export default api;

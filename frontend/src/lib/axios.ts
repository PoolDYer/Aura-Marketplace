import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

type JwtPayload = {
  exp?: number;
};

let refreshRequest: Promise<string> | null = null;

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalized)) as JwtPayload;
  } catch {
    return null;
  }
};

const shouldRefreshToken = (token: string) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;

  const expiresAt = payload.exp * 1000;
  const refreshWindowMs = 30 * 1000;
  return expiresAt - Date.now() <= refreshWindowMs;
};

const isRefreshRequest = (url?: string) => {
  if (!url) return false;
  return new URL(url, api.defaults.baseURL).pathname === '/auth/refresh';
};

const refreshAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
      const authStore = useAuthStore.getState();

      authStore.setAuth(data.user, data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);

      return data.accessToken as string;
    })().finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
};

api.interceptors.request.use(
  async (config) => {
    let { accessToken } = useAuthStore.getState();

    if (accessToken && shouldRefreshToken(accessToken) && !isRefreshRequest(config.url)) {
      accessToken = await refreshAccessToken();
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        localStorage.removeItem('refresh_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

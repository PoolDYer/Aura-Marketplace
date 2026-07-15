import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { clearNeonSession, getCurrentNeonToken, syncNeonSession } from './neonAuth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

type JwtPayload = {
  exp?: number;
  iss?: string;
};

let refreshRequest: Promise<string> | null = null;
let isClearingSession = false;

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

const isLocalAccessToken = (token: string) => {
  const payload = decodeJwtPayload(token);
  return Boolean(payload && (!payload.iss || !payload.iss.includes('neonauth')));
};

const refreshAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const authStore = useAuthStore.getState();

      const currentToken = authStore.accessToken;
      if (currentToken && isLocalAccessToken(currentToken)) {
        return currentToken;
      }

      const result = authStore.user
        ? { user: authStore.user, accessToken: await getCurrentNeonToken() }
        : await syncNeonSession();

      authStore.setAuth(result.user, result.accessToken);
      return result.accessToken;
    })().finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
};

const clearInvalidAuthSession = async () => {
  if (isClearingSession) return;

  isClearingSession = true;
  try {
    useAuthStore.getState().logout();
    await clearNeonSession();
  } finally {
    isClearingSession = false;
  }
};

api.interceptors.request.use(
  async (config) => {
    let { accessToken } = useAuthStore.getState();

    if (accessToken && shouldRefreshToken(accessToken)) {
      try {
        accessToken = await refreshAccessToken();
      } catch {
        // Never clear the local session during background refresh.
        // The user should stay logged in until they press the logout button.
      }
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

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await clearInvalidAuthSession();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      await clearInvalidAuthSession();
    }

    return Promise.reject(error);
  },
);

export default api;

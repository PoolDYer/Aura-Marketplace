import axios from 'axios';
import { createAuthClient } from '@neondatabase/neon-js/auth';
import type { UserRole } from './validations';

const NEON_AUTH_URL =
  import.meta.env.VITE_NEON_AUTH_URL ||
  'https://ep-red-darkness-acsr0yn8.neonauth.sa-east-1.aws.neon.tech/neondb/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authClient = createAuthClient(NEON_AUTH_URL);

type NeonSessionData = {
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
  session?: {
    token?: string;
    access_token?: string;
  };
  token?: string;
};

export type AuraAuthUser = {
  id: string;
  nombre: string;
  email: string;
  rol: 'COMPRADOR' | 'VENDEDOR' | 'ADMINISTRADOR';
};

const pendingRoleKey = (email: string) => `aura_pending_role:${email.toLowerCase()}`;

export function rememberPendingRole(email: string, role: UserRole) {
  localStorage.setItem(pendingRoleKey(email), role);
}

export function consumePendingRole(email: string) {
  const key = pendingRoleKey(email);
  const role = localStorage.getItem(key);
  localStorage.removeItem(key);
  return role === 'VENDEDOR' || role === 'COMPRADOR' ? role : undefined;
}

export function getNeonSessionToken(data: unknown) {
  const sessionData = data as NeonSessionData | null;
  return sessionData?.session?.token || sessionData?.session?.access_token || sessionData?.token || null;
}

export async function getCurrentNeonToken() {
  const { data, error } = await authClient.getSession();
  if (error) throw new Error(error.message || 'No se pudo leer la sesion de Neon');

  const token = getNeonSessionToken(data);
  if (!token) throw new Error('No hay sesion activa en Neon');

  return token;
}

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export async function clearNeonSession() {
  await authClient.signOut().catch(() => undefined);
}

export async function syncNeonSession(options: { nombre?: string; rol?: UserRole } = {}) {
  const { data, error } = await authClient.getSession();
  if (error) throw new Error(error.message || 'No se pudo leer la sesion de Neon');

  const token = getNeonSessionToken(data);
  if (!token) throw new Error('No hay sesion activa en Neon');

  const response = await axios.post<{ user: AuraAuthUser }>(
    `${API_URL}/auth/sync`,
    options,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    },
  );

  return {
    user: response.data.user,
    accessToken: token,
  };
}

export async function getNeonRegistrationStatus() {
  const token = await getCurrentNeonToken();
  const response = await axios.post<{
    registered: boolean;
    user: AuraAuthUser | null;
    neonUser: {
      id: string;
      email: string;
      nombre: string;
      emailVerified: boolean;
    };
  }>(
    `${API_URL}/auth/neon-status`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    },
  );

  return {
    ...response.data,
    accessToken: token,
  };
}

export async function completeGoogleRegistration(options: {
  nombre: string;
  password: string;
  rol?: UserRole;
}) {
  const token = await getCurrentNeonToken();
  const response = await axios.post<{ user: AuraAuthUser }>(
    `${API_URL}/auth/complete-google-registration`,
    options,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    },
  );

  return {
    user: response.data.user,
    accessToken: token,
  };
}

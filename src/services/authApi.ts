/**
 * Dark Fantasy Cloud Save & Authentication API Service
 */

const API_BASE = '/api';
const TOKEN_STORAGE_KEY = 'd2_auth_token';
const USER_STORAGE_KEY = 'd2_auth_user';

export interface AuthUser {
  username: string;
  displayName: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  saveData?: any;
  error?: string;
}

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: AuthUser) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to store auth:', err);
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {}
}

export async function registerApi(username: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.success && data.token && data.user) {
      setStoredAuth(data.token, data.user);
    }
    return data;
  } catch (err: any) {
    return { success: false, error: '서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.' };
  }
};

export async function loginApi(username: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.success && data.token && data.user) {
      setStoredAuth(data.token, data.user);
    }
    return data;
  } catch (err: any) {
    return { success: false, error: '서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.' };
  }
}

export async function loadCloudSaveApi(): Promise<{ success: boolean; saveData?: any; error?: string }> {
  const token = getStoredAuthToken();
  if (!token) return { success: false, error: '로그인이 필요합니다.' };

  try {
    const res = await fetch(`${API_BASE}/save/load`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.status === 401) {
      clearStoredAuth();
      return { success: false, error: '세션이 만료되었습니다. 다시 로그인해주세요.' };
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: '클라우드 세이브를 불러오지 못했습니다.' };
  }
}

export async function syncCloudSaveApi(saveData: any): Promise<{ success: boolean; syncedAt?: string; error?: string }> {
  const token = getStoredAuthToken();
  if (!token) return { success: false, error: '로그인이 필요합니다.' };

  try {
    const res = await fetch(`${API_BASE}/save/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ saveData })
    });
    if (res.status === 401) {
      clearStoredAuth();
      return { success: false, error: '세션이 만료되었습니다.' };
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: '클라우드 동기화 실패' };
  }
}

export async function logoutApi(): Promise<void> {
  const token = getStoredAuthToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}
  }
  clearStoredAuth();
}

import { apiUrl } from './config';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'curator';
  is_active: boolean;
};

export type AuthTokens = {
  access_token: string;
  access_expires_at: string;
  token_type: 'Bearer';
};

export type LoginResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type RefreshResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(apiUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid email or password');
  }

  return response.json();
}

export async function refreshSession(): Promise<RefreshResponse> {
  const response = await fetch(apiUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to refresh session');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  await fetch(apiUrl('/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await fetch(apiUrl('/auth/me'), {
    credentials: 'include',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}` },
  });

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  return response.json();
}

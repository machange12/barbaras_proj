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

export type PendingUser = {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'curator';
  is_active: boolean;
  created_at: string;
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
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}` },
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

export async function register(name: string, email: string, password: string): Promise<PendingUser> {
  const response = await fetch(apiUrl('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error('Unable to submit account request');
  }

  return response.json();
}

export async function listPendingUsers(): Promise<PendingUser[]> {
  const response = await fetch(apiUrl('/auth/pending-users'), {
    credentials: 'include',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}` },
  });

  if (!response.ok) {
    throw new Error('Unable to load pending users');
  }

  return response.json();
}

export async function approvePendingUser(id: string): Promise<PendingUser> {
  const response = await fetch(apiUrl(`/auth/pending-users/${id}/approve`), {
    method: 'POST',
    credentials: 'include',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}` },
  });

  if (!response.ok) {
    throw new Error('Unable to approve user');
  }

  return response.json();
}

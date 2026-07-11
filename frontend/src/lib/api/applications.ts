import { apiRequest } from './client';
import { apiUrl } from './config';

export type ApplicationPayload = {
  name: string;
  email: string;
  question: string;
  intent: string;
};

export type ApplicationResponse = {
  status: string;
  message: string;
  received_at: string;
  data: Record<string, string>;
};

export type ApplicationSummary = {
  id: string;
  status: string;
  received_at: string;
  name: string;
  email: string;
};

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const submissionsApi = {
  submit: (payload: ApplicationPayload) =>
    apiRequest<ApplicationResponse>(apiUrl('/applications'), {
      method: 'POST',
      body: payload,
    }),
  list: (status?: string) => {
    const url = status
      ? `${apiUrl('/applications')}?status=${encodeURIComponent(status)}`
      : apiUrl('/applications');
    return fetch(url, {
      headers: { ...authHeaders() },
      credentials: 'include',
    }).then(async (res) => {
      if (!res.ok) throw new Error('Failed to fetch applications');
      return res.json() as Promise<ApplicationSummary[]>;
    });
  },
  get: (id: string) =>
    fetch(apiUrl(`/applications/${id}`), {
      headers: { ...authHeaders() },
      credentials: 'include',
    }).then(async (res) => {
      if (!res.ok) throw new Error('Application not found');
      return res.json() as Promise<ApplicationResponse>;
    }),
};

export const applicationKeys = {
  all: ['applications'] as const,
  list: (status?: string) => [...applicationKeys.all, 'list', status] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
};

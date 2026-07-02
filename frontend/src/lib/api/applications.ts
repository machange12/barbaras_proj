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

export const submissionsApi = {
  submit: (payload: ApplicationPayload) =>
    apiRequest<ApplicationResponse>(apiUrl('/applications'), {
      method: 'POST',
      body: payload,
    }),
  list: () =>
    apiRequest<ApplicationSummary[]>(apiUrl('/applications'), { method: 'GET' }),
  get: (id: string) =>
    apiRequest<ApplicationResponse>(apiUrl(`/applications/${id}`), { method: 'GET' }),
};

export const applicationKeys = {
  all: ['applications'] as const,
  list: () => [...applicationKeys.all, 'list'] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
};

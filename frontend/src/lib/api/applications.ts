import { apiRequest, ApiError, type ApiErrorBody } from './client';
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
  whatsapp_invite_sent: boolean;
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

async function parseError(response: Response): Promise<ApiError> {
  let parsed: ApiErrorBody | undefined;
  try {
    parsed = (await response.json()) as ApiErrorBody;
  } catch {
    // body wasn't JSON
  }
  const detailText =
    typeof parsed?.detail === 'string' ? parsed.detail : response.statusText || `Request failed with status ${response.status}`;
  return new ApiError(response.status, detailText, parsed);
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
  updateStatus: async (id: string, status: string): Promise<ApplicationResponse> => {
    const response = await fetch(apiUrl(`/applications/${id}/status`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw await parseError(response);
    return response.json() as Promise<ApplicationResponse>;
  },
  sendWhatsappInvite: async (id: string): Promise<ApplicationResponse> => {
    const response = await fetch(apiUrl(`/applications/${id}/send-whatsapp`), {
      method: 'POST',
      headers: { ...authHeaders() },
      credentials: 'include',
    });
    if (!response.ok) throw await parseError(response);
    return response.json() as Promise<ApplicationResponse>;
  },
};

export const applicationKeys = {
  all: ['applications'] as const,
  list: (status?: string) => [...applicationKeys.all, 'list', status] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
};

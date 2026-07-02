export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export const API_PREFIX = '/api/v1';

export const apiUrl = (path: string): string => {
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${trimmed.startsWith(API_PREFIX) ? trimmed : `${API_PREFIX}${trimmed}`}`;
};

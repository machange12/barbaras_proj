import { apiUrl } from './config';
import { ApiError, type ApiErrorBody } from './client';

export type LibraryMaterial = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  file_name: string;
  file_size_bytes: number;
  material_type: string;
  created_at: string;
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

export const libraryApi = {
  list: (): Promise<LibraryMaterial[]> =>
    fetch(apiUrl('/library'), {
      headers: { ...authHeaders() },
      credentials: 'include',
    }).then(async (res) => {
      if (!res.ok) throw await parseError(res);
      return res.json() as Promise<LibraryMaterial[]>;
    }),
  upload: async (formData: FormData): Promise<LibraryMaterial> => {
    const response = await fetch(apiUrl('/library'), {
      method: 'POST',
      headers: { ...authHeaders() },
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) throw await parseError(response);
    return response.json() as Promise<LibraryMaterial>;
  },
  download: async (id: string, fileName: string): Promise<void> => {
    const response = await fetch(apiUrl(`/library/${id}/download`), {
      headers: { ...authHeaders() },
      credentials: 'include',
    });
    if (!response.ok) throw await parseError(response);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
  delete: async (id: string): Promise<void> => {
    const response = await fetch(apiUrl(`/library/${id}`), {
      method: 'DELETE',
      headers: { ...authHeaders() },
      credentials: 'include',
    });
    if (!response.ok) throw await parseError(response);
  },
};

export const libraryKeys = {
  all: ['library'] as const,
  list: ['library', 'list'] as const,
};

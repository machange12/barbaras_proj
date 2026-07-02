export const REQUEST_TIMEOUT_MS = 10_000;

type ApiErrorBody = {
  detail?: string | { msg: string; field?: string }[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly detail?: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = typeof body?.detail === 'string' ? body.detail : undefined;

    if (Array.isArray(body?.detail)) {
      this.fieldErrors = {};
      for (const entry of body.detail) {
        if (entry.field) {
          this.fieldErrors[entry.field] = entry.msg;
        }
      }
    }
  }
}

export type JsonRequest = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

async function parseError(response: Response): Promise<ApiError> {
  let parsed: ApiErrorBody | undefined;
  try {
    parsed = (await response.json()) as ApiErrorBody;
  } catch {
    // body wasn't JSON
  }
  const detailText =
    typeof parsed?.detail === 'string'
      ? parsed.detail
      : response.statusText || `Request failed with status ${response.status}`;
  return new ApiError(response.status, detailText, parsed);
}

export async function apiRequest<T>(path: string, options: JsonRequest = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: options.signal ?? controller.signal,
  };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(path, init);
    if (!response.ok) {
      throw await parseError(response);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

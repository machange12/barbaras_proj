import { ApiError, type ApiErrorBody } from './client';
import { apiUrl } from './config';

export type ChatChannel = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  curator_only_posting: boolean;
};

export type ChatMessage = {
  id: string;
  channel_id: string;
  author_id: string;
  author_name: string;
  author_role: 'member' | 'curator';
  body: string;
  created_at: string;
  edited_at: string | null;
};

export type MessageList = {
  items: ChatMessage[];
  has_more: boolean;
};

export type ChatUser = {
  user_id: string;
  name: string;
  role: 'member' | 'curator';
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
    typeof parsed?.detail === 'string'
      ? parsed.detail
      : response.statusText || `Request failed with status ${response.status}`;
  return new ApiError(response.status, detailText, parsed);
}

export const chatApi = {
  channels: (): Promise<ChatChannel[]> =>
    fetch(apiUrl('/chat/channels'), {
      headers: { ...authHeaders() },
      credentials: 'include',
    }).then(async (res) => {
      if (!res.ok) throw await parseError(res);
      return res.json() as Promise<ChatChannel[]>;
    }),
  messages: (channelId: string, { limit = 50, before }: { limit?: number; before?: string } = {}): Promise<MessageList> => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (before) params.set('before', before);
    const query = params.toString();
    return fetch(`${apiUrl(`/chat/channels/${channelId}/messages`)}?${query}`, {
      headers: { ...authHeaders() },
      credentials: 'include',
    }).then(async (res) => {
      if (!res.ok) throw await parseError(res);
      return res.json() as Promise<MessageList>;
    });
  },
  post: (channelId: string, body: string): Promise<ChatMessage> =>
    fetch(apiUrl(`/chat/channels/${channelId}/messages`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      body: JSON.stringify({ body }),
    }).then(async (res) => {
      if (!res.ok) throw await parseError(res);
      return res.json() as Promise<ChatMessage>;
    }),
  remove: (messageId: string): Promise<void> =>
    fetch(apiUrl(`/chat/messages/${messageId}`), {
      method: 'DELETE',
      headers: { ...authHeaders() },
      credentials: 'include',
    }).then(async (res) => {
      if (!res.ok) throw await parseError(res);
    }),
};

export const chatKeys = {
  all: ['chat'] as const,
  channels: ['chat', 'channels'] as const,
  messages: (channelId: string) => ['chat', 'messages', channelId] as const,
};
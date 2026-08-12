import { useCallback, useEffect, useRef, useState } from 'react';
import { apiUrl } from '../../lib/api/config';
import type { ChatMessage, ChatUser } from '../../lib/api/chat';

export type ChatConnectionStatus = 'connecting' | 'open' | 'reconnecting';

type ChatSocketEvent =
  | { type: 'welcome'; user: ChatUser }
  | { type: 'presence'; online: ChatUser[] }
  | { type: 'message'; channel: string; data: ChatMessage }
  | { type: 'message_deleted'; channel: string; message_id: string }
  | { type: 'error'; message: string };

function toWsUrl(url: string): string {
  if (url.startsWith('https://')) return `wss://${url.slice(8)}`;
  if (url.startsWith('http://')) return `ws://${url.slice(7)}`;
  return url;
}

export function useChatSocket() {
  const [status, setStatus] = useState<ChatConnectionStatus>('connecting');
  const [online, setOnline] = useState<ChatUser[]>([]);
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, ChatMessage[]>>({});
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const closedRef = useRef(false);
  const onlineRef = useRef<ChatUser[]>([]);
  const messagesRef = useRef<Record<string, ChatMessage[]>>({});

  const applyEvent = useCallback((event: ChatSocketEvent) => {
    if (event.type === 'presence') {
      onlineRef.current = event.online;
      setOnline(event.online);
      return;
    }
    if (event.type === 'message') {
      const list = messagesRef.current[event.channel] ?? [];
      const exists = list.some((message) => message.id === event.data.id);
      if (!exists) {
        const next = [...list, event.data];
        messagesRef.current = { ...messagesRef.current, [event.channel]: next };
        setMessagesByChannel(messagesRef.current);
      }
      return;
    }
    if (event.type === 'message_deleted') {
      const list = messagesRef.current[event.channel];
      if (list) {
        const next = list.filter((message) => message.id !== event.message_id);
        messagesRef.current = { ...messagesRef.current, [event.channel]: next };
        setMessagesByChannel(messagesRef.current);
      }
      return;
    }
    if (event.type === 'error') {
      setError(event.message);
    }
  }, []);

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setStatus('reconnecting');
      return;
    }
    const base = toWsUrl(apiUrl('/chat/ws'));
    const separator = base.includes('?') ? '&' : '?';
    const ws = new WebSocket(`${base}${separator}token=${encodeURIComponent(token)}`);
    socketRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => {
      retryRef.current = 0;
      setStatus('open');
      setError(null);
    };

    ws.onmessage = (raw) => {
      try {
        applyEvent(JSON.parse(raw.data) as ChatSocketEvent);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      socketRef.current = null;
      if (closedRef.current) return;
      setStatus('reconnecting');
      const delay = Math.min(1000 * 2 ** retryRef.current, 15000);
      retryRef.current += 1;
      window.setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [applyEvent]);

  useEffect(() => {
    closedRef.current = false;
    connect();
    return () => {
      closedRef.current = true;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [connect]);

  const sendMessage = useCallback((channelId: string, body: string): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ type: 'message', channel: channelId, body }));
    return true;
  }, []);

  const sendDelete = useCallback((messageId: string): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ type: 'delete', message_id: messageId }));
    return true;
  }, []);

  return { status, online, messagesByChannel, error, sendMessage, sendDelete };
}
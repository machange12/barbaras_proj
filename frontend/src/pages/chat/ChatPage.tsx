import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Loader2, MessagesSquare, Send, Trash2, Users, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useChatSocket } from '../../features/chat/useChatSocket';
import { chatApi, chatKeys, type ChatChannel, type ChatMessage } from '../../lib/api/chat';

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function mergeChronological(history: ChatMessage[], live: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const message of history) byId.set(message.id, message);
  for (const message of live) byId.set(message.id, message);
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function ChatPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { status: socketStatus, online, messagesByChannel, error: socketError, sendMessage } = useChatSocket();

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const channelRef = useRef<string | null>(null);

  const channelsQuery = useQuery({
    queryKey: chatKeys.channels,
    queryFn: chatApi.channels,
  });

  const channels = channelsQuery.data ?? [];
  const activeChannel: ChatChannel | undefined = channels.find((channel) => channel.id === activeChannelId) ?? channels[0];
  const currentChannelId = activeChannel?.id ?? null;

  useEffect(() => {
    if (currentChannelId && activeChannelId !== currentChannelId) {
      setActiveChannelId(currentChannelId);
    }
  }, [currentChannelId, activeChannelId]);

  const historyQuery = useInfiniteQuery({
    queryKey: chatKeys.messages(currentChannelId ?? 'none'),
    queryFn: ({ pageParam }) => {
      if (!currentChannelId) return { items: [], has_more: false };
      return chatApi.messages(currentChannelId, { limit: 50, before: pageParam ?? undefined });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.has_more && lastPage.items.length > 0 ? lastPage.items[0].created_at : undefined,
    enabled: Boolean(currentChannelId),
  });

  const historyOrdered = useMemo(() => {
    const pages = historyQuery.data?.pages ?? [];
    const reversed = pages.slice().reverse();
    const items = reversed.flatMap((page) => page.items);
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [historyQuery.data?.pages]);

  const merged = useMemo(
    () => mergeChronological(historyOrdered, messagesByChannel[currentChannelId ?? ''] ?? []),
    [historyOrdered, messagesByChannel, currentChannelId],
  );

  const isCurator = user?.role === 'curator';

  const removeMessage = useMutation({
    mutationFn: chatApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
    onError: (err) => {
      setSendError(err instanceof Error ? err.message : 'Unable to delete message.');
    },
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickRef.current = distance < 90;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (merged.length === 0) return;
    const changed = channelRef.current !== currentChannelId;
    channelRef.current = currentChannelId;
    if (changed || stickRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: changed ? 'auto' : 'smooth' });
    }
  }, [merged.length, currentChannelId]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeChannel) return;
    const body = draft.trim();
    if (!body) return;
    setSendError(null);

    if (!isCurator && activeChannel.curator_only_posting) {
      setSendError('Only the curator can post in this channel.');
      return;
    }

    if (socketStatus === 'open') {
      const sent = sendMessage(activeChannel.id, body);
      if (sent) {
        setDraft('');
        return;
      }
    }

    try {
      await chatApi.post(activeChannel.id, body);
      setDraft('');
      void queryClient.invalidateQueries({ queryKey: chatKeys.messages(activeChannel.id) });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Unable to send message. Try again.');
    }
  }

  function handleComposerKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const form = (event.target as HTMLTextAreaElement).form;
      form?.requestSubmit();
    }
  }

  function confirmDelete(message: ChatMessage) {
    setDeleteId(message.id);
    void removeMessage.mutateAsync(message.id).finally(() => setDeleteId(null));
  }

  return (
    <main className="mx-auto flex max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
      <aside className="w-64 shrink-0">
        <div className="rounded-2xl border border-brass/20 bg-[#2d1c13]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2 font-serif text-sm uppercase tracking-[0.24em] text-brass">
            <MessagesSquare aria-hidden className="size-4" />
            Salon Chat
          </div>
          <p className="mt-1 text-xs leading-5 text-parchment/50">
            Members-only conversation, in the manner of the salon.
          </p>

          <div className="mt-5 space-y-1">
            {channelsQuery.isLoading && (
              <p className="py-3 text-sm text-parchment/40">Loading channels…</p>
            )}
            {channelsQuery.isError && (
              <p className="py-3 text-sm text-[#ffb59e]">Unable to load channels.</p>
            )}
            {channelsQuery.data?.map((channel) => {
              const active = channel.id === currentChannelId;
              return (
                <button
                  className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    active
                      ? 'border-brass bg-brass/15 text-parchment'
                      : 'border-transparent text-parchment/70 hover:border-brass/40 hover:text-parchment'
                  }`}
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  type="button"
                >
                  <span className="block truncate">{channel.name}</span>
                  {channel.curator_only_posting ? (
                    <span className="mt-0.5 block text-[10px] uppercase tracking-[0.18em] text-brass">
                      Curator only
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-brass/15 pt-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-parchment/50">
              <Users aria-hidden className="size-3.5" />
              In the room · {online.length}
            </div>
            <ul className="mt-3 space-y-2">
              {online.map((member) => (
                <li className="flex items-center gap-2 text-sm text-parchment/75" key={member.user_id}>
                  <span
                    aria-hidden
                    className="inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-400"
                  />
                  <span className="truncate">
                    {member.name}
                    {member.role === 'curator' ? (
                      <span className="ml-1 text-xs text-brass">· Curator</span>
                    ) : null}
                  </span>
                </li>
              ))}
              {online.length === 0 ? (
                <li className="text-xs text-parchment/40">Only you, for now.</li>
              ) : null}
            </ul>
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-brass/15 pt-4 text-xs text-parchment/60">
            {socketStatus === 'open' ? (
              <Wifi aria-hidden className="size-3.5 text-emerald-400" />
            ) : (
              <WifiOff aria-hidden className="size-3.5 text-brass" />
            )}
            {socketStatus === 'open'
              ? 'Live'
              : socketStatus === 'connecting'
                ? 'Connecting…'
                : 'Reconnecting…'}
          </div>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        {!activeChannel ? (
          <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-brass/20 bg-[#2d1c13]/60 text-parchment/50">
            No channels available.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-brass/20 bg-[#2d1c13]/85 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
            <header className="border-b border-brass/20 px-6 py-4">
              <h1 className="font-serif text-xl text-parchment">{activeChannel.name}</h1>
              {activeChannel.description ? (
                <p className="mt-1 text-xs leading-5 text-parchment/55">{activeChannel.description}</p>
              ) : null}
              {activeChannel.curator_only_posting && !isCurator ? (
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brass">
                  Members read here; only the curator posts.
                </p>
              ) : null}
            </header>

            <div ref={scrollRef} className="h-[52vh] overflow-y-auto px-6 py-5">
              {historyQuery.isLoading && (
                <div className="flex items-center justify-center py-16 text-parchment/40">
                  <Loader2 aria-hidden className="mr-2 size-4 animate-spin" />
                  Loading the salon…
                </div>
              )}

              {historyQuery.isError && (
                <p className="py-16 text-center text-sm text-[#ffb59e]">
                  Failed to load messages. Please try again.
                </p>
              )}

              {!historyQuery.isLoading && !historyQuery.isError && merged.length === 0 && (
                <p className="py-16 text-center text-sm text-parchment/45">
                  The room is quiet. Write the first note.
                </p>
              )}

              {historyQuery.hasNextPage ? (
                <button
                  className="mx-auto mb-4 block rounded-full border border-brass/30 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-brass transition hover:border-brass hover:bg-brass/10"
                  disabled={historyQuery.isFetchingNextPage}
                  onClick={() => void historyQuery.fetchNextPage()}
                  type="button"
                >
                  {historyQuery.isFetchingNextPage ? 'Loading…' : 'Show earlier notes'}
                </button>
              ) : null}

              <div className="space-y-4">
                {merged.map((message) => {
                  const mine = message.author_id === user?.id;
                  const canDelete = mine || isCurator;
                  return (
                    <div className="group flex items-start gap-3" key={message.id}>
                      <div className="min-w-0 flex-1 rounded-xl border border-brass/15 bg-[#1a0f0a]/60 px-4 py-3">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span
                            className={`text-sm font-medium ${
                              mine ? 'text-brass' : 'text-parchment'
                            }`}
                          >
                            {message.author_name}
                          </span>
                          {message.author_role === 'curator' ? (
                            <span className="rounded-full border border-brass/30 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-brass">
                              Curator
                            </span>
                          ) : null}
                          <span className="text-xs text-parchment/40" title={new Date(message.created_at).toLocaleString()}>
                            {formatDay(message.created_at)}, {formatTime(message.created_at)}
                          </span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-parchment/85">
                          {message.body}
                        </p>
                      </div>
                      {canDelete ? (
                        <button
                          aria-label={`Delete message by ${message.author_name}`}
                          className="self-center rounded-md border border-red-500/30 p-1.5 text-red-300 transition hover:border-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={deleteId === message.id}
                          onClick={() => confirmDelete(message)}
                          type="button"
                        >
                          <Trash2 aria-hidden className="size-3.5" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div ref={bottomRef} />
            </div>

            <footer className="border-t border-brass/20 p-5">
              {socketError && !activeChannel.curator_only_posting ? (
                <p className="mb-2 text-xs text-[#ffb59e]">{socketError}</p>
              ) : null}
              {sendError && (
                <p className="mb-2 text-xs text-[#ffb59e]" role="alert">
                  {sendError}
                </p>
              )}
              <form className="flex items-end gap-3" onSubmit={(event) => void handleSend(event)}>
                <label className="sr-only" htmlFor="chat-composer">
                  Write a message
                </label>
                <textarea
                  className="min-h-11 max-h-40 flex-1 resize-y rounded-xl border border-brass/25 bg-[#150f0b]/70 px-4 py-3 text-sm text-parchment outline-none transition focus:border-brass/70 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={activeChannel.curator_only_posting && !isCurator}
                  id="chat-composer"
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleComposerKey}
                  placeholder={
                    activeChannel.curator_only_posting && !isCurator
                      ? 'This channel is read-only.'
                      : 'Write to the salon…  (Enter to send)'
                  }
                  rows={2}
                  value={draft}
                />
                <button
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-brass/40 bg-[#2b1e17] px-4 text-sm uppercase tracking-[0.16em] text-parchment/90 transition hover:border-brass hover:text-parchment disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    (!draft.trim() && !activeChannel.curator_only_posting) ||
                    (activeChannel.curator_only_posting && !isCurator)
                  }
                  type="submit"
                >
                  <Send aria-hidden className="size-4" />
                  Send
                </button>
              </form>
            </footer>
          </div>
        )}
      </section>
    </main>
  );
}
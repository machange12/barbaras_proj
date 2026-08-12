import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submissionsApi, applicationKeys } from '../../lib/api/applications';

const STATUS_COLORS: Record<string, string> = {
  received: 'bg-brass/20 text-brass',
  reviewed: 'bg-blue-500/20 text-blue-300',
  accepted: 'bg-emerald-500/20 text-emerald-300',
  declined: 'bg-red-500/20 text-red-300',
};

export function ApplicationDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => submissionsApi.get(id),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });

  const accept = useMutation({
    mutationFn: () => submissionsApi.updateStatus(id, 'accepted'),
    onSuccess: invalidate,
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-parchment">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-parchment/50 transition hover:text-parchment"
      >
        Back to applications
      </button>

      {isLoading && (
        <div className="flex items-center justify-center py-24 text-parchment/40">
          Loading...
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-300">
          Application not found or failed to load.
        </div>
      )}

      {data && (
        <div className="rounded-3xl border border-brass/20 bg-[#2d1c13]/70 p-8 shadow-xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl text-parchment">{data.data.name}</h1>
              <p className="mt-1 text-sm text-parchment/60">{data.data.email}</p>
            </div>
            <span
              className={`inline-block rounded-full px-4 py-1 text-sm font-medium capitalize ${
                STATUS_COLORS[data.status] ?? 'bg-parchment/10 text-parchment/60'
              }`}
            >
              {data.status}
            </span>
          </div>

          <div className="mb-1 text-xs uppercase tracking-widest text-parchment/40">
            Received
          </div>
          <p className="mb-6 text-sm text-parchment/70">
            {new Date(data.received_at).toLocaleString('en-GB', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>

          {(data.status === 'received' || data.status === 'reviewed') && (
            <div className="mb-6">
              <button
                onClick={() => accept.mutate()}
                disabled={accept.isPending}
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                {accept.isPending ? 'Accepting...' : 'Accept application'}
              </button>
              {accept.isError && (
                <p className="mt-2 text-sm text-red-300">Unable to accept this application.</p>
              )}
            </div>
          )}

          {data.status === 'accepted' && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-brass/20 bg-brass/10 px-5 py-2.5 text-sm text-brass">
              Salon chat access is enabled for this member.
            </div>
          )}

          <div className="mb-5">
            <div className="mb-2 text-xs uppercase tracking-widest text-parchment/40">
              Their question for the salon
            </div>
            <p className="rounded-xl border border-brass/10 bg-[#150f0b]/60 px-5 py-4 text-parchment/90 leading-relaxed">
              {data.data.question}
            </p>
          </div>

          <div>
            <div className="mb-2 text-xs uppercase tracking-widest text-parchment/40">
              Why they want to join
            </div>
            <p className="rounded-xl border border-brass/10 bg-[#150f0b]/60 px-5 py-4 text-parchment/90 leading-relaxed whitespace-pre-wrap">
              {data.data.intent}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

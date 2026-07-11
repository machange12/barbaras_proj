import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../features/auth/AuthContext';
import { submissionsApi, applicationKeys, type ApplicationSummary } from '../../lib/api/applications';
import { ApplicationDetail } from './ApplicationDetail';

const STATUS_OPTIONS = ['', 'received', 'reviewed', 'accepted', 'declined'] as const;
const STATUS_LABELS: Record<string, string> = {
  '': 'All',
  received: 'Received',
  reviewed: 'Reviewed',
  accepted: 'Accepted',
  declined: 'Declined',
};
const STATUS_COLORS: Record<string, string> = {
  received: 'bg-brass/20 text-brass',
  reviewed: 'bg-blue-500/20 text-blue-300',
  accepted: 'bg-emerald-500/20 text-emerald-300',
  declined: 'bg-red-500/20 text-red-300',
};

export function CuratorDashboard() {
  const { user, logout } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: applications, isLoading, isError, refetch } = useQuery({
    queryKey: applicationKeys.list(statusFilter || undefined),
    queryFn: () => submissionsApi.list(statusFilter || undefined),
  });

  if (selectedId) {
    return (
      <ApplicationDetail
        id={selectedId}
        onBack={() => {
          setSelectedId(null);
          void refetch();
        }}
      />
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-parchment">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl uppercase tracking-[0.2em] text-parchment">
            Curator Dashboard
          </h1>
          <p className="mt-1 text-sm text-parchment/60">
            Signed in as <span className="text-brass">{user?.name}</span>
          </p>
        </div>
        <button
          onClick={() => void logout()}
          className="rounded-xl border border-brass/30 px-4 py-2 text-sm text-parchment/70 transition hover:border-brass/70 hover:text-parchment"
        >
          Sign out
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              statusFilter === status
                ? 'border-brass bg-brass/20 text-brass'
                : 'border-brass/20 text-parchment/60 hover:border-brass/50 hover:text-parchment'
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24 text-parchment/40">
          Loading applications...
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-300">
          Failed to load applications. Make sure you are signed in as a curator.
        </div>
      )}

      {!isLoading && !isError && applications?.length === 0 && (
        <div className="flex items-center justify-center py-24 text-parchment/40">
          No applications{statusFilter ? ` with status "${statusFilter}"` : ''}.
        </div>
      )}

      {!isLoading && !isError && (applications?.length ?? 0) > 0 && (
        <div className="overflow-hidden rounded-2xl border border-brass/20">
          <table className="w-full text-sm">
            <thead className="bg-[#2d1c13] text-left text-parchment/50 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Received</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brass/10">
              {applications!.map((app: ApplicationSummary) => (
                <tr
                  key={app.id}
                  className="bg-[#1a0f0a]/60 transition hover:bg-[#2d1c13]/80"
                >
                  <td className="px-5 py-4 font-medium text-parchment">{app.name}</td>
                  <td className="px-5 py-4 text-parchment/70">{app.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium capitalize ${
                        STATUS_COLORS[app.status] ?? 'bg-parchment/10 text-parchment/60'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-parchment/50">
                    {new Date(app.received_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedId(app.id)}
                      className="rounded-lg border border-brass/30 px-3 py-1 text-xs text-brass transition hover:border-brass hover:bg-brass/10"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

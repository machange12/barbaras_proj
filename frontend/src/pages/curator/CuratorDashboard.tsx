import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { approvePendingUser, listPendingUsers } from '../../lib/api/auth';
import { submissionsApi, applicationKeys, type ApplicationSummary } from '../../lib/api/applications';
import { libraryApi, libraryKeys, type LibraryMaterial } from '../../lib/api/library';
import { ApiError } from '../../lib/api/client';
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

const TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  epub: 'EPUB',
  text: 'Text',
  other: 'File',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function LibraryTab() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: materials, isLoading, isError } = useQuery({
    queryKey: libraryKeys.list,
    queryFn: libraryApi.list,
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: libraryKeys.list });

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Choose a file to upload');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      if (author.trim()) formData.append('author', author.trim());
      if (description.trim()) formData.append('description', description.trim());
      return libraryApi.upload(formData);
    },
    onSuccess: (material) => {
      setTitle('');
      setAuthor('');
      setDescription('');
      setFile(null);
      setSuccessMessage(`Uploaded "${material.title}" to the library.`);
      setErrorMessage(null);
      invalidate();
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError && error.detail ? error.detail : 'Upload failed. Try again.',
      );
    },
  });

  const remove = useMutation({
    mutationFn: libraryApi.delete,
    onSuccess: invalidate,
  });

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    upload.mutate();
  }

  function confirmDelete(material: LibraryMaterial) {
    if (window.confirm(`Delete "${material.title}" from the library?`)) {
      remove.mutate(material.id);
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-brass/20 bg-[#1a0f0a]/60 p-6">
        <h2 className="font-serif text-xl uppercase tracking-[0.18em] text-parchment">Upload material</h2>
        <p className="mt-1 text-sm text-parchment/50">
          PDF, EPUB, TXT, MD, DOC, DOCX — up to 50 MB.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-parchment/50">
                Title <span className="text-brass">*</span>
              </span>
              <input
                className="w-full rounded-xl border border-brass/20 bg-[#150f0b]/60 px-4 py-2.5 text-sm text-parchment outline-none transition focus:border-brass/60"
                maxLength={255}
                onChange={(e) => setTitle(e.target.value)}
                required
                type="text"
                value={title}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-parchment/50">Author</span>
              <input
                className="w-full rounded-xl border border-brass/20 bg-[#150f0b]/60 px-4 py-2.5 text-sm text-parchment outline-none transition focus:border-brass/60"
                maxLength={200}
                onChange={(e) => setAuthor(e.target.value)}
                type="text"
                value={author}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-parchment/50">Description</span>
            <textarea
              className="w-full resize-y rounded-xl border border-brass/20 bg-[#150f0b]/60 px-4 py-2.5 text-sm text-parchment outline-none transition focus:border-brass/60"
              maxLength={2000}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              value={description}
            />
          </label>

          <div>
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-parchment/50">
              File <span className="text-brass">*</span>
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <input
                accept=".pdf,.epub,.txt,.md,.doc,.docx"
                className="block w-full max-w-md text-sm text-parchment/70 file:mr-4 file:rounded-lg file:border file:border-brass/30 file:bg-[#2b1e17] file:px-4 file:py-2 file:text-sm file:text-parchment/80 hover:file:border-brass/70"
                onChange={handleFileChange}
                required
                type="file"
              />
              {file ? (
                <span className="text-xs uppercase tracking-[0.18em] text-brass">
                  {file.name} · {formatBytes(file.size)}
                </span>
              ) : null}
            </div>
          </div>

          <button
            className="rounded-xl border border-brass/40 bg-[#2b1e17] px-6 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-parchment/80 transition hover:border-brass hover:text-parchment disabled:cursor-not-allowed disabled:opacity-60"
            disabled={upload.isPending || !file || !title.trim()}
            type="submit"
          >
            {upload.isPending ? 'Uploading...' : 'Upload to Library'}
          </button>

          {successMessage && (
            <p className="text-sm text-emerald-300">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="text-sm text-red-300">{errorMessage}</p>
          )}
        </form>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-serif text-xl uppercase tracking-[0.18em] text-parchment">Materials</h2>
          <span className="rounded-full border border-brass/20 px-3 py-1 text-xs text-parchment/60">
            {materials?.length ?? 0} items
          </span>
        </div>

        {isLoading && <p className="py-6 text-sm text-parchment/40">Loading library materials...</p>}
        {isError && <p className="py-6 text-sm text-[#ffb59e]">Unable to load library materials.</p>}

        {!isLoading && !isError && (materials?.length ?? 0) === 0 && (
          <p className="py-6 text-sm text-parchment/40">No materials uploaded yet.</p>
        )}

        {!isLoading && !isError && (materials?.length ?? 0) > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {materials!.map((material: LibraryMaterial) => (
              <article
                className="flex flex-col rounded-[1rem] border border-brass/20 bg-[#2d1c13]/80 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition hover:border-brass/50"
                key={material.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-brass/20 bg-brass/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brass">
                    {TYPE_LABELS[material.material_type] ?? 'File'}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-parchment/40">
                    {formatBytes(material.file_size_bytes)}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-xl leading-snug text-[#f8efe0]">{material.title}</h3>
                {material.author ? (
                  <p className="mt-1 text-sm text-parchment/60">{material.author}</p>
                ) : null}

                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <span className="text-xs uppercase tracking-[0.2em] text-parchment/40">
                    {new Date(material.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 transition hover:border-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={remove.isPending}
                    onClick={() => confirmDelete(material)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function CuratorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'library'>('applications');

  const { data: applications, isLoading, isError, refetch } = useQuery({
    queryKey: applicationKeys.list(statusFilter || undefined),
    queryFn: () => submissionsApi.list(statusFilter || undefined),
  });
  const { data: pendingUsers, isLoading: isLoadingPendingUsers, isError: isPendingUsersError } = useQuery({
    queryKey: ['auth', 'pending-users'],
    queryFn: listPendingUsers,
  });
  const approveUser = useMutation({
    mutationFn: approvePendingUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'pending-users'] });
    },
  });

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

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
          onClick={() => void handleLogout()}
          className="rounded-xl border border-brass/30 px-4 py-2 text-sm text-parchment/70 transition hover:border-brass/70 hover:text-parchment"
        >
          Sign out
        </button>
      </div>

      <div className="mb-8 flex gap-2">
        {(['applications', 'library'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-5 py-1.5 text-sm uppercase tracking-[0.18em] transition ${
              activeTab === tab
                ? 'border-brass bg-brass/20 text-brass'
                : 'border-brass/20 text-parchment/60 hover:border-brass/50 hover:text-parchment'
            }`}
            type="button"
          >
            {tab === 'applications' ? 'Applications' : 'Library'}
          </button>
        ))}
      </div>

      {activeTab === 'library' ? (
        <LibraryTab />
      ) : (
        <>
          <section className="mb-10 rounded-2xl border border-brass/20 bg-[#1a0f0a]/60 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl uppercase tracking-[0.18em] text-parchment">User approvals</h2>
                <p className="mt-1 text-sm text-parchment/50">Approve requested member accounts after review.</p>
              </div>
              <span className="rounded-full border border-brass/20 px-3 py-1 text-xs text-parchment/60">
                {pendingUsers?.length ?? 0} pending
              </span>
            </div>
            {isLoadingPendingUsers ? (
              <p className="py-6 text-sm text-parchment/40">Loading user requests...</p>
            ) : isPendingUsersError ? (
              <p className="py-6 text-sm text-[#ffb59e]">Unable to load pending users.</p>
            ) : pendingUsers?.length ? (
              <div className="grid gap-3">
                {pendingUsers.map((pendingUser) => (
                  <div
                    className="flex flex-col justify-between gap-3 rounded-xl border border-brass/10 bg-[#2d1c13]/70 p-4 sm:flex-row sm:items-center"
                    key={pendingUser.id}
                  >
                    <div>
                      <p className="font-medium text-parchment">{pendingUser.name}</p>
                      <p className="text-sm text-parchment/60">{pendingUser.email}</p>
                    </div>
                    <button
                      className="rounded-lg border border-brass/30 px-3 py-2 text-sm text-brass transition hover:border-brass hover:bg-brass/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={approveUser.isPending}
                      onClick={() => approveUser.mutate(pendingUser.id)}
                      type="button"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-sm text-parchment/40">No user requests waiting for approval.</p>
            )}
          </section>

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
        </>
      )}
    </main>
  );
}

import { useQuery } from '@tanstack/react-query';
import { FileDown } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { libraryApi, libraryKeys, type LibraryMaterial } from '../../lib/api/library';

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

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function LibraryPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: libraryKeys.list,
    queryFn: libraryApi.list,
  });

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-parchment">
        <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">The Library</p>
        <p className="mt-6 text-lg text-parchment/70">Library access is for members. Apply to join.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-parchment">
      <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">The Library</p>
      <h1 className="mt-4 font-serif text-3xl uppercase tracking-[0.18em] text-parchment sm:text-4xl">
        Reading materials
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-parchment/60">
        Books, essays, and documents chosen for the salon. Download anything you need.
      </p>

      <div className="mt-12">
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-parchment/40">
            Loading the library...
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-300">
            Failed to load the library. Please try again.
          </div>
        )}

        {!isLoading && !isError && (data?.length ?? 0) === 0 && (
          <div className="flex items-center justify-center py-24 text-parchment/40">
            The library shelf is empty for now.
          </div>
        )}

        {!isLoading && !isError && (data?.length ?? 0) > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {data!.map((material: LibraryMaterial) => (
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

                <h2 className="mt-4 font-serif text-xl leading-snug text-[#f8efe0]">{material.title}</h2>
                {material.author ? (
                  <p className="mt-1 text-sm text-parchment/60">{material.author}</p>
                ) : null}

                {material.description ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-parchment/70">
                    {material.description}
                  </p>
                ) : null}

                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <span className="text-xs uppercase tracking-[0.2em] text-parchment/40">
                    {formatDate(material.created_at)}
                  </span>
                  <button
                    onClick={() => void libraryApi.download(material.id, material.file_name)}
                    className="inline-flex items-center gap-2 rounded-lg border border-brass/30 bg-[#2b1e17] px-4 py-2 text-sm text-parchment/80 transition hover:border-brass hover:text-parchment"
                    type="button"
                  >
                    <FileDown aria-hidden className="size-4" />
                    Download
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

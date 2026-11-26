export function EmptyState({
  title,
  message,
  tone = 'dark',
}: {
  title: string;
  message: string;
  tone?: 'dark' | 'paper';
}) {
  const paper = tone === 'paper';

  return (
    <div className={`empty-state ${paper ? 'empty-state--paper' : ''}`}>
      <span
        aria-hidden="true"
        className={`font-display text-2xl ${paper ? 'text-wine/50' : 'text-gold-dim'}`}
      >
        ✦
      </span>
      <h2
        className={`mt-4 font-display text-2xl sm:text-3xl ${
          paper ? 'text-wine' : 'text-ivory'
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-3 max-w-xl text-base leading-relaxed ${
          paper ? 'text-ink/65' : 'text-muted'
        }`}
      >
        {message}
      </p>
    </div>
  );
}

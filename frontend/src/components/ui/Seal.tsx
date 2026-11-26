type SealSize = 'sm' | 'md' | 'lg';

export function Seal({ size = 'md', className = '' }: { size?: SealSize; className?: string }) {
  return (
    <span aria-hidden="true" className={`seal seal--${size} ${className}`}>
      <span className="seal__ring" />
      <span className="seal__letter">B</span>
    </span>
  );
}

import { useId } from 'react';

/**
 * Ornate antique-gold wax seal.
 * Pure SVG so it scales cleanly and every highlight is vector — no image asset.
 */
export function OrnateSeal({ title }: { title?: string }) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const id = (name: string) => `seal-${name}-${uid}`;
  const rays = Array.from({ length: 32 }, (_, i) => i * (360 / 32));

  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className="seal-body"
      role={title ? 'img' : undefined}
      viewBox="0 0 200 200"
    >
      <defs>
        <radialGradient id={id('wax')} cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#9d3346" />
          <stop offset="45%" stopColor="#6b1b2a" />
          <stop offset="100%" stopColor="#2a0a11" />
        </radialGradient>
        <linearGradient id={id('gilt')} x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#f6e3ae" />
          <stop offset="26%" stopColor="#c9a45f" />
          <stop offset="52%" stopColor="#8a6a35" />
          <stop offset="74%" stopColor="#e6cf94" />
          <stop offset="100%" stopColor="#9c7c3f" />
        </linearGradient>
        <linearGradient id={id('ring')} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3dfae" />
          <stop offset="40%" stopColor="#b58f4b" />
          <stop offset="70%" stopColor="#7d6130" />
          <stop offset="100%" stopColor="#d8bb7c" />
        </linearGradient>
        <radialGradient id={id('shine')} cx="30%" cy="22%" r="55%">
          <stop offset="0%" stopColor="#fff6dd" stopOpacity="0.72" />
          <stop offset="70%" stopColor="#fff6dd" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#fff6dd" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* wax body */}
      <circle cx="100" cy="100" r="97" fill={`url(#${id('wax')})`} />
      <circle cx="100" cy="100" r="97" fill="none" stroke="#170a0d" strokeWidth="2" opacity="0.7" />

      {/* beaded rim */}
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke={`url(#${id('ring')})`}
        strokeDasharray="1.2 6.4"
        strokeLinecap="round"
        strokeWidth="4"
      />

      {/* concentric gilt rings */}
      <circle cx="100" cy="100" r="83" fill="none" stroke={`url(#${id('ring')})`} strokeWidth="2.5" />
      <circle cx="100" cy="100" r="77" fill="none" stroke="#5a4420" strokeWidth="1.4" opacity="0.85" />
      <circle cx="100" cy="100" r="74" fill="none" stroke={`url(#${id('ring')})`} strokeWidth="3" />

      {/* starburst */}
      <g opacity="0.5" stroke={`url(#${id('ring')})`} strokeWidth="1.1">
        {rays.map((angle) => (
          <line
            key={angle}
            x1="100"
            y1="38"
            x2="100"
            y2="46"
            transform={`rotate(${angle} 100 100)`}
          />
        ))}
      </g>

      {/* inner field */}
      <circle cx="100" cy="100" r="66" fill={`url(#${id('wax')})`} />
      <circle cx="100" cy="100" r="66" fill="none" stroke={`url(#${id('ring')})`} strokeWidth="1.6" />

      {/* monogram, embossed */}
      <g fontFamily="'Playfair Display', Georgia, serif" textAnchor="middle">
        <text
          x="100"
          y="130"
          fontSize="76"
          fill="#1a0508"
          opacity="0.75"
          transform="translate(0 3)"
        >
          B
        </text>
        <text x="100" y="130" fontSize="76" fill="#fff3d4" opacity="0.4" transform="translate(0 -1.5)">
          B
        </text>
        <text x="100" y="130" fontSize="76" fill={`url(#${id('gilt')})`}>
          B
        </text>
      </g>

      {/* specular light */}
      <ellipse cx="74" cy="64" rx="52" ry="38" fill={`url(#${id('shine')})`} />
    </svg>
  );
}

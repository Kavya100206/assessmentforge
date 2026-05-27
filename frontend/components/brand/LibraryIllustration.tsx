export function LibraryIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="260"
      height="220"
      viewBox="0 0 260 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="libBookmark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF7A3D" />
          <stop offset="100%" stopColor="#E91E63" />
        </linearGradient>
      </defs>

      {/* halo */}
      <circle cx="130" cy="110" r="100" fill="#F1F2F4" />

      {/* back paper, rotated slightly */}
      <g transform="rotate(-7 130 110)">
        <rect x="74" y="52" width="112" height="124" rx="10" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="88" y="72" width="84" height="6" rx="3" fill="#EEF0F2" />
        <rect x="88" y="88" width="64" height="5" rx="2.5" fill="#F1F2F4" />
        <rect x="88" y="102" width="74" height="5" rx="2.5" fill="#F1F2F4" />
      </g>

      {/* middle paper */}
      <g transform="rotate(3 130 110)">
        <rect x="74" y="52" width="112" height="124" rx="10" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="88" y="72" width="76" height="6" rx="3" fill="#E5E7EB" />
        <rect x="88" y="88" width="56" height="5" rx="2.5" fill="#EEF0F2" />
        <rect x="88" y="102" width="80" height="5" rx="2.5" fill="#EEF0F2" />
        <rect x="88" y="116" width="46" height="5" rx="2.5" fill="#EEF0F2" />
      </g>

      {/* front paper with content */}
      <rect x="70" y="50" width="120" height="128" rx="12" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" />
      {/* header bar */}
      <rect x="86" y="66" width="68" height="7" rx="3.5" fill="#1A1A1A" />
      <rect x="86" y="80" width="44" height="5" rx="2.5" fill="#9CA3AF" />
      {/* divider */}
      <line x1="86" y1="96" x2="174" y2="96" stroke="#E5E7EB" strokeWidth="1" />
      {/* lines */}
      <rect x="86" y="104" width="88" height="4" rx="2" fill="#E5E7EB" />
      <rect x="86" y="114" width="72" height="4" rx="2" fill="#EEF0F2" />
      <rect x="86" y="124" width="80" height="4" rx="2" fill="#EEF0F2" />
      <rect x="86" y="134" width="58" height="4" rx="2" fill="#EEF0F2" />
      {/* mini badges */}
      <rect x="86" y="148" width="22" height="10" rx="3" fill="#D1FAE5" />
      <rect x="112" y="148" width="22" height="10" rx="3" fill="#FEF3C7" />
      <rect x="138" y="148" width="22" height="10" rx="3" fill="#FFE4E6" />

      {/* bookmark ribbon */}
      <path
        d="M 158 50 h 14 v 32 l -7 -6 l -7 6 z"
        fill="url(#libBookmark)"
      />

      {/* sparkles */}
      <g fill="#FBD0DD">
        <path d="M 36 78 l 2.5 5 l 5 2.5 l -5 2.5 l -2.5 5 l -2.5 -5 l -5 -2.5 l 5 -2.5 z" opacity="0.9" />
        <path d="M 222 160 l 2 4 l 4 2 l -4 2 l -2 4 l -2 -4 l -4 -2 l 4 -2 z" opacity="0.9" />
        <circle cx="220" cy="60" r="3" />
        <circle cx="48" cy="170" r="2.5" />
      </g>
    </svg>
  );
}

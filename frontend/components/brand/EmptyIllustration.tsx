export function EmptyIllustration({ className = '' }: { className?: string }) {
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
      {/* soft background circle */}
      <circle cx="130" cy="110" r="100" fill="#F1F2F4" />

      {/* back paper */}
      <rect x="78" y="48" width="120" height="118" rx="10" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
      <rect x="92" y="68" width="92" height="6" rx="3" fill="#E5E7EB" />
      <rect x="92" y="84" width="60" height="6" rx="3" fill="#EEF0F2" />
      <rect x="92" y="100" width="78" height="6" rx="3" fill="#EEF0F2" />
      <rect x="92" y="116" width="48" height="6" rx="3" fill="#EEF0F2" />

      {/* sparkles */}
      <g fill="#FBD0DD">
        <path d="M40 70l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" opacity="0.9" />
        <path d="M220 168l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" opacity="0.9" />
        <circle cx="218" cy="62" r="3" />
        <circle cx="52" cy="170" r="2.5" />
      </g>

      {/* magnifying glass */}
      <g transform="translate(86 88)">
        <circle cx="56" cy="56" r="50" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="3.5" />
        <circle cx="56" cy="56" r="50" fill="#FFFFFF" fillOpacity="0.4" />
        <line
          x1="92"
          y1="92"
          x2="118"
          y2="118"
          stroke="#1A1A1A"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* red X inside the lens */}
        <g stroke="#E91E63" strokeWidth="6" strokeLinecap="round">
          <line x1="38" y1="38" x2="74" y2="74" />
          <line x1="74" y1="38" x2="38" y2="74" />
        </g>
      </g>
    </svg>
  );
}

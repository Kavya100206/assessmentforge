export function GroupsIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="280"
      height="220"
      viewBox="0 0 280 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="groupsBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCE7EE" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F1F2F4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="groupsCenter" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF7A3D" />
          <stop offset="100%" stopColor="#E91E63" />
        </linearGradient>
      </defs>

      {/* halo */}
      <circle cx="140" cy="110" r="105" fill="url(#groupsBg)" />

      {/* connection lines */}
      <g stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 5" fill="none">
        <path d="M 140 110 Q 90 70 60 60" />
        <path d="M 140 110 Q 200 70 230 60" />
        <path d="M 140 110 Q 80 160 50 180" />
        <path d="M 140 110 Q 210 160 240 180" />
      </g>

      {/* outer satellite nodes */}
      <SatelliteAvatar cx={60} cy={60} initial="P" tint="#FFE4D9" ink="#C2410C" />
      <SatelliteAvatar cx={230} cy={60} initial="A" tint="#D1FAE5" ink="#047857" />
      <SatelliteAvatar cx={50} cy={180} initial="R" tint="#DBEAFE" ink="#1D4ED8" />
      <SatelliteAvatar cx={240} cy={180} initial="M" tint="#EDE9FE" ink="#6D28D9" />

      {/* center hub */}
      <circle cx="140" cy="110" r="44" fill="url(#groupsCenter)" />
      <circle cx="140" cy="110" r="44" fill="white" fillOpacity="0.05" />

      {/* center icon: stylized 3-person group */}
      <g transform="translate(140 110)" fill="white">
        {/* left head */}
        <circle cx="-14" cy="-4" r="6" />
        {/* right head */}
        <circle cx="14" cy="-4" r="6" />
        {/* center (front) head */}
        <circle cx="0" cy="-7" r="7" />
        {/* bodies — overlapping arcs */}
        <path d="M -24 16 a 10 10 0 0 1 20 0 v 4 h -20 z" />
        <path d="M 4 16 a 10 10 0 0 1 20 0 v 4 h -20 z" />
        <path d="M -12 19 a 12 12 0 0 1 24 0 v 5 h -24 z" />
      </g>

      {/* sparkles */}
      <g fill="#FBD0DD">
        <path d="M 32 110 l 2.5 5 l 5 2.5 l -5 2.5 l -2.5 5 l -2.5 -5 l -5 -2.5 l 5 -2.5 z" opacity="0.9" />
        <path d="M 255 120 l 2 4 l 4 2 l -4 2 l -2 4 l -2 -4 l -4 -2 l 4 -2 z" opacity="0.9" />
        <circle cx="190" cy="35" r="2.5" />
        <circle cx="90" cy="200" r="2" />
      </g>
    </svg>
  );
}

function SatelliteAvatar({
  cx,
  cy,
  initial,
  tint,
  ink,
}: {
  cx: number;
  cy: number;
  initial: string;
  tint: string;
  ink: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="20" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="16" fill={tint} />
      <text
        x={cx}
        y={cy + 4.5}
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill={ink}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {initial}
      </text>
    </g>
  );
}

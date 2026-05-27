interface LogoProps {
  className?: string;
  withWordmark?: boolean;
}

export function Logo({ className = '', withWordmark = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark />
      {withWordmark && (
        <span className="text-[20px] font-semibold tracking-tight text-ink">
          VedaAI
        </span>
      )}
    </div>
  );
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vedaLogo" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF7A3D" />
          <stop offset="1" stopColor="#FF3D7F" />
        </linearGradient>
      </defs>
      <path
        d="M4 5.2c0-.66.54-1.2 1.2-1.2h3.3c.48 0 .92.29 1.1.74L14 16.6 18.4 4.74A1.2 1.2 0 0 1 19.5 4h3.3c.66 0 1.2.54 1.2 1.2 0 .16-.03.32-.1.47L15.7 23.32a1.2 1.2 0 0 1-1.1.68h-1.2a1.2 1.2 0 0 1-1.1-.68L4.1 5.67A1.2 1.2 0 0 1 4 5.2Z"
        fill="url(#vedaLogo)"
      />
    </svg>
  );
}

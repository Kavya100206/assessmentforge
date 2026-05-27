'use client';

import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onChange: (next: string) => void;
  options: readonly string[];
  className?: string;
  placeholder?: string;
}

export function Select({
  value,
  onChange,
  options,
  className = '',
  placeholder,
}: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full h-10 pl-3 pr-9 rounded-xl bg-surface-card border border-line text-[13px] text-ink focus:outline-none focus:border-ink/30 transition-colors cursor-pointer"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}

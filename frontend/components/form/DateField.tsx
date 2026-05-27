'use client';

import { Calendar } from 'lucide-react';
import { useRef } from 'react';

interface DateFieldProps {
  value: string; // DD-MM-YYYY
  onChange: (next: string) => void;
  className?: string;
}

export function DateField({ value, onChange, className = '' }: DateFieldProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  // value is DD-MM-YYYY; the native input expects YYYY-MM-DD
  const isoValue = value && /^\d{2}-\d{2}-\d{4}$/.test(value)
    ? value.split('-').reverse().join('-')
    : '';

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const masked = maskDate(e.target.value);
          onChange(masked);
        }}
        placeholder="DD-MM-YYYY"
        className="w-full h-11 pl-4 pr-12 rounded-xl bg-surface-card border border-line text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/30 transition-colors"
        inputMode="numeric"
        maxLength={10}
      />
      <button
        type="button"
        onClick={() => hiddenRef.current?.showPicker?.()}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-line-soft transition-colors"
        aria-label="Open calendar"
      >
        <Calendar className="w-4 h-4" strokeWidth={2} />
      </button>
      {/* Hidden native date input to provide a free calendar popup */}
      <input
        ref={hiddenRef}
        type="date"
        value={isoValue}
        onChange={(e) => {
          const iso = e.target.value; // YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
            const [y, m, d] = iso.split('-');
            onChange(`${d}-${m}-${y}`);
          }
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}

function maskDate(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  return parts.join('-');
}

export function ddmmyyyyToISO(ddmmyyyy: string): string | null {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(ddmmyyyy)) return null;
  const [d, m, y] = ddmmyyyy.split('-');
  const date = new Date(`${y}-${m}-${d}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

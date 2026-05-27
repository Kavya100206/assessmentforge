'use client';

import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

export function Stepper({ value, onChange, min = 0, max = 999 }: StepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center h-10 rounded-xl border border-line bg-surface-card overflow-hidden">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className="w-9 h-full inline-flex items-center justify-center text-ink-muted hover:text-ink hover:bg-line-soft disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label="Decrease"
      >
        <Minus className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        className="w-10 h-full text-center text-[14px] font-medium text-ink bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
      />
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="w-9 h-full inline-flex items-center justify-center text-ink-muted hover:text-ink hover:bg-line-soft disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label="Increase"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

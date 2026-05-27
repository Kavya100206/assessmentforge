'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export type DateFilter = 'all' | 'due-soon' | 'recent';

const FILTER_OPTIONS: { value: DateFilter; label: string; hint: string }[] = [
  { value: 'all', label: 'All assignments', hint: 'No date filter' },
  { value: 'due-soon', label: 'Due Soon', hint: 'Due within 7 days' },
  { value: 'recent', label: 'Recent', hint: 'Created in last 7 days' },
];

interface FilterSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  filter: DateFilter;
  onFilterChange: (f: DateFilter) => void;
}

export function FilterSearchBar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
}: FilterSearchBarProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const current = FILTER_OPTIONS.find((o) => o.value === filter) ?? FILTER_OPTIONS[0];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center justify-between gap-3 h-10 px-4 rounded-xl bg-surface-card border text-[13px] transition-colors sm:min-w-[180px] ${
            filter !== 'all'
              ? 'border-ink/20 text-ink'
              : 'border-line text-ink-muted hover:text-ink'
          }`}
        >
          <span className="truncate">
            {filter === 'all' ? 'Filter By' : current.label}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
        </button>

        {open && (
          <div className="absolute left-0 top-12 z-30 w-64 bg-surface-card border border-line rounded-xl shadow-floating overflow-hidden">
            {FILTER_OPTIONS.map((opt) => {
              const selected = opt.value === filter;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onFilterChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                    selected ? 'bg-line-soft' : 'hover:bg-line-soft/60'
                  }`}
                >
                  <span className="mt-0.5 w-4 h-4 inline-flex items-center justify-center shrink-0">
                    {selected && (
                      <Check className="w-4 h-4 text-ink" strokeWidth={2.5} />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-medium text-ink">
                      {opt.label}
                    </span>
                    <span className="block text-[11px] text-ink-muted mt-0.5">
                      {opt.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted"
          strokeWidth={2}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search Assignment"
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-card border border-line text-[13px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/30 transition-colors"
        />
      </div>
    </div>
  );
}

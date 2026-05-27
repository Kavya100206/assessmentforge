'use client';

import { ChevronDown, Search, X } from 'lucide-react';

export type StatusFilter = 'all' | 'completed' | 'processing' | 'failed';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Ready' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
];

interface LibraryFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  subject: string;
  onSubjectChange: (s: string) => void;
  subjects: string[];
  status: StatusFilter;
  onStatusChange: (s: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}

export function LibraryFilters({
  query,
  onQueryChange,
  subject,
  onSubjectChange,
  subjects,
  status,
  onStatusChange,
  counts,
}: LibraryFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted"
            strokeWidth={2}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by title..."
            className="w-full h-11 pl-9 pr-9 rounded-xl bg-surface-card border border-line text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/30 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-line-soft transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Subject */}
        <div className="relative lg:w-56">
          <select
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="appearance-none w-full h-11 pl-4 pr-9 rounded-xl bg-surface-card border border-line text-[13px] text-ink focus:outline-none focus:border-ink/30 transition-colors cursor-pointer"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none"
            strokeWidth={2}
          />
        </div>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1">
        {STATUS_TABS.map((t) => {
          const active = status === t.value;
          const count = counts[t.value];
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onStatusChange(t.value)}
              className={`shrink-0 inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-ink text-white'
                  : 'bg-surface-card border border-line text-ink-muted hover:text-ink hover:bg-line-soft'
              }`}
            >
              {t.label}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'bg-line-soft text-ink-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

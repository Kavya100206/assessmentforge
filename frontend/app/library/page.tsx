'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { LibraryInsights } from '@/components/library/LibraryInsights';
import {
  LibraryFilters,
  type StatusFilter,
} from '@/components/library/LibraryFilters';
import { LibraryCard } from '@/components/library/LibraryCard';
import { LibraryEmptyState } from '@/components/library/LibraryEmptyState';
import { Toast } from '@/components/library/Toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getSocket } from '@/lib/socket';
import type { Assignment } from '@/lib/types';

export default function LibraryPage() {
  const { assignments, loading, fetched, fetchAssignments } = useAssignmentStore();

  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [toast, setToast] = useState<string | null>(null);

  // initial fetch
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // real-time updates
  useEffect(() => {
    const socket = getSocket();
    const refetch = () => fetchAssignments();
    socket.on('assignment:updated', refetch);
    return () => {
      socket.off('assignment:updated', refetch);
    };
  }, [fetchAssignments]);

  // refetch on focus/visibility
  useEffect(() => {
    const onFocus = () => fetchAssignments();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchAssignments();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchAssignments]);

  // derived: unique subjects from completed assignments
  const subjects = useMemo(() => {
    const set = new Set<string>();
    for (const a of assignments) {
      const s = a.generatedOutput?.subject?.trim();
      if (s) set.add(s);
    }
    return Array.from(set).sort();
  }, [assignments]);

  // derived: counts by status for the pill badges
  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = {
      all: assignments.length,
      completed: 0,
      processing: 0,
      failed: 0,
    };
    for (const a of assignments) {
      if (a.status === 'completed') base.completed += 1;
      else if (a.status === 'processing' || a.status === 'pending')
        base.processing += 1;
      else if (a.status === 'failed') base.failed += 1;
    }
    return base;
  }, [assignments]);

  // derived: filtered list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assignments
      .filter((a) => matchesStatus(a, status))
      .filter((a) => (subject ? a.generatedOutput?.subject === subject : true))
      .filter((a) => (q ? a.title.toLowerCase().includes(q) : true))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [assignments, query, subject, status]);

  const onCopyLink = async (id: string) => {
    const url = `${window.location.origin}/output/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast('Link copied to clipboard');
    } catch {
      // fallback: select-and-copy via a hidden input
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy');
        setToast('Link copied to clipboard');
      } catch {
        setToast('Could not copy link');
      }
      document.body.removeChild(input);
    }
  };

  const initialLoading = !fetched && loading;
  const isAllEmpty = fetched && !loading && assignments.length === 0;
  const filteredEmpty = !isAllEmpty && filtered.length === 0;

  return (
    <AppShell breadcrumb="Library">
      <div className="px-6 pt-6 pb-12 space-y-6 lg:space-y-7">
        {/* Header */}
        <header>
          <h1 className="text-[22px] lg:text-[28px] font-bold text-ink leading-tight">
            My Library
          </h1>
          <p className="mt-1.5 text-[13px] lg:text-[14px] text-ink-muted max-w-2xl">
            Access, organize, and reuse your previously generated assessments.
          </p>
        </header>

        {/* Insights */}
        <LibraryInsights assignments={assignments} loading={initialLoading} />

        {isAllEmpty ? (
          <LibraryEmptyState />
        ) : (
          <>
            {/* Filters */}
            <LibraryFilters
              query={query}
              onQueryChange={setQuery}
              subject={subject}
              onSubjectChange={setSubject}
              subjects={subjects}
              status={status}
              onStatusChange={setStatus}
              counts={counts}
            />

            {/* Grid */}
            {initialLoading ? (
              <LoadingGrid />
            ) : filteredEmpty ? (
              <FilteredEmpty
                onReset={() => {
                  setQuery('');
                  setSubject('');
                  setStatus('all');
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                {filtered.map((a) => (
                  <LibraryCard
                    key={a._id}
                    assignment={a}
                    onCopyLink={onCopyLink}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}

function matchesStatus(a: Assignment, f: StatusFilter): boolean {
  if (f === 'all') return true;
  if (f === 'processing') return a.status === 'processing' || a.status === 'pending';
  return a.status === f;
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-card border border-line rounded-[20px] p-5 animate-pulse h-[220px]"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-line-soft" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-line-soft rounded" />
              <div className="h-3 w-1/2 bg-line-soft rounded" />
            </div>
            <div className="h-5 w-14 rounded-full bg-line-soft" />
          </div>
          <div className="h-14 mt-5 rounded-xl bg-line-soft" />
          <div className="h-10 mt-5 rounded-xl bg-line-soft" />
        </div>
      ))}
    </div>
  );
}

function FilteredEmpty({ onReset }: { onReset: () => void }) {
  return (
    <div className="bg-surface-card border border-line rounded-[20px] px-6 py-12 text-center">
      <p className="text-[15px] font-semibold text-ink">No matches</p>
      <p className="mt-1 text-[13px] text-ink-muted">
        No assessments match your current filters.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center h-10 px-4 rounded-xl bg-ink text-white text-[13px] font-medium hover:bg-ink/90 transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
}

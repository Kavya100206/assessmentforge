'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { AssignmentCard } from '@/components/AssignmentCard';
import { FilterSearchBar, type DateFilter } from '@/components/FilterSearchBar';
import { FloatingCreateButton } from '@/components/FloatingCreateButton';

export default function AssignmentsPage() {
  const { assignments, loading, error, fetched, fetchAssignments, deleteAssignment } =
    useAssignmentStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<DateFilter>('all');

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    return assignments.filter((a) => {
      if (q && !a.title.toLowerCase().includes(q)) return false;
      if (filter === 'due-soon') {
        const due = new Date(a.dueDate).getTime();
        if (!Number.isFinite(due)) return false;
        if (due < now || due - now > week) return false;
      } else if (filter === 'recent') {
        const created = new Date(a.createdAt).getTime();
        if (!Number.isFinite(created)) return false;
        if (now - created > week) return false;
      }
      return true;
    });
  }, [assignments, query, filter]);

  const isEmpty = fetched && !loading && assignments.length === 0 && !error;
  const showList = fetched && !loading && assignments.length > 0;

  return (
    <AppShell breadcrumb="Assignment">
      <div className="px-6 pt-6">
        {showList && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h1 className="text-[22px] lg:text-[24px] font-semibold text-ink">
                Assignments
              </h1>
            </div>
            <p className="mt-1 text-[13px] text-ink-muted">
              Manage and create assignments for your classes.
            </p>
          </div>
        )}

        {!fetched && loading && <LoadingState />}

        {error && (
          <div className="bg-surface-card border border-line rounded-xl p-6 text-[14px] text-accent">
            {error}
            <button
              type="button"
              onClick={() => fetchAssignments()}
              className="ml-3 underline"
            >
              Retry
            </button>
          </div>
        )}

        {isEmpty && <EmptyState />}

        {showList && (
          <>
            <div className="mb-5">
              <FilterSearchBar
                query={query}
                onQueryChange={setQuery}
                filter={filter}
                onFilterChange={setFilter}
              />
            </div>
            {filtered.length === 0 ? (
              <p className="text-[14px] text-ink-muted">
                No assignments match your filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((a) => (
                  <AssignmentCard
                    key={a._id}
                    assignment={a}
                    onDelete={deleteAssignment}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showList && <FloatingCreateButton />}
    </AppShell>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-card border border-line rounded-xl px-5 py-4 animate-pulse"
        >
          <div className="h-4 w-3/4 bg-line-soft rounded" />
          <div className="mt-4 flex items-center justify-between">
            <div className="h-3 w-1/3 bg-line-soft rounded" />
            <div className="h-3 w-1/4 bg-line-soft rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

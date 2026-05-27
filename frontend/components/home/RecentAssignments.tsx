import Link from 'next/link';
import { ArrowRight, FileText, Plus } from 'lucide-react';
import type { Assignment } from '@/lib/types';

interface RecentAssignmentsProps {
  assignments: Assignment[];
  loading: boolean;
  limit?: number;
}

const STATUS_STYLES: Record<Assignment['status'], string> = {
  pending: 'bg-line-soft text-ink-muted',
  processing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
};

const STATUS_LABEL: Record<Assignment['status'], string> = {
  pending: 'Queued',
  processing: 'Generating',
  completed: 'Ready',
  failed: 'Failed',
};

export function RecentAssignments({
  assignments,
  loading,
  limit = 4,
}: RecentAssignmentsProps) {
  const recent = [...assignments]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[16px] lg:text-[17px] font-semibold text-ink">
          Recent Assignments
        </h2>
        {recent.length > 0 && (
          <Link
            href="/assignments"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-muted hover:text-ink transition-colors"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="bg-surface-card border border-line rounded-[20px] divide-y divide-line overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-line-soft" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/2 bg-line-soft rounded" />
                <div className="h-2.5 w-1/3 bg-line-soft rounded" />
              </div>
              <div className="h-6 w-16 rounded-full bg-line-soft" />
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <EmptyInline />
      ) : (
        <div className="bg-surface-card border border-line rounded-[20px] divide-y divide-line overflow-hidden">
          {recent.map((a) => (
            <RecentRow key={a._id} assignment={a} />
          ))}
        </div>
      )}
    </section>
  );
}

function RecentRow({ assignment }: { assignment: Assignment }) {
  const subject = assignment.generatedOutput?.subject;
  const totalQ = assignment.generatedOutput?.sections.reduce(
    (s, sec) => s + sec.questions.length,
    0
  );

  return (
    <Link
      href={`/output/${assignment._id}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-line-soft/60 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-line-soft text-ink-muted flex items-center justify-center shrink-0">
        <FileText className="w-[18px] h-[18px]" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-ink truncate">
          {assignment.title}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-muted truncate">
          {subject ? `${subject} · ` : ''}
          {totalQ ? `${totalQ} questions · ` : ''}
          Created {timeAgo(assignment.createdAt)}
        </p>
      </div>
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${STATUS_STYLES[assignment.status]}`}
      >
        {STATUS_LABEL[assignment.status]}
      </span>
    </Link>
  );
}

function EmptyInline() {
  return (
    <div className="bg-surface-card border border-line rounded-[20px] px-6 py-10 text-center">
      <p className="text-[15px] font-semibold text-ink">
        No assignments yet
      </p>
      <p className="mt-1 text-[13px] text-ink-muted max-w-sm mx-auto">
        Create your first question paper and it&apos;ll show up here for quick
        access.
      </p>
      <Link
        href="/assignments/create"
        className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-ink text-white text-[13px] font-medium hover:bg-ink/90 transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Create your first assignment
      </Link>
    </div>
  );
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

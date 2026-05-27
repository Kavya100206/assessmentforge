'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Eye, Link as LinkIcon, ArrowUpRight, FileText } from 'lucide-react';
import type { Assignment } from '@/lib/types';

interface LibraryCardProps {
  assignment: Assignment;
  onCopyLink: (id: string) => void;
}

const STATUS_STYLES: Record<Assignment['status'], string> = {
  pending: 'bg-line-soft text-ink-muted',
  processing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
};

const STATUS_LABEL: Record<Assignment['status'], string> = {
  pending: 'Queued',
  processing: 'Processing',
  completed: 'Ready',
  failed: 'Failed',
};

export function LibraryCard({ assignment, onCopyLink }: LibraryCardProps) {
  const router = useRouter();
  const out = assignment.generatedOutput;
  const subject = out?.subject ?? '—';
  const className = out?.className ?? '—';
  const totalQuestions =
    out?.sections.reduce((s, sec) => s + sec.questions.length, 0) ?? 0;
  const totalMarks = out?.maxMarks ?? sumMarksFromTypes(assignment);
  const isReady = assignment.status === 'completed' && !!out;
  const created = formatDate(assignment.createdAt);

  const openOutput = () => router.push(`/output/${assignment._id}`);
  const downloadPdf = () => router.push(`/output/${assignment._id}?download=1`);
  const copyLink = () => onCopyLink(assignment._id);

  return (
    <div className="group bg-surface-card border border-line rounded-[20px] p-5 flex flex-col transition-all hover:border-ink/15 hover:shadow-card">
      {/* header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-line-soft text-ink-muted flex items-center justify-center shrink-0">
          <FileText className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </div>
        <button
          type="button"
          onClick={isReady ? openOutput : undefined}
          disabled={!isReady}
          className="flex-1 min-w-0 text-left disabled:cursor-default"
        >
          <p className="text-[15px] font-semibold text-ink truncate group-hover:text-ink">
            {assignment.title}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-muted truncate">
            {subject} · Class {className}
          </p>
        </button>
        <span
          className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${STATUS_STYLES[assignment.status]}`}
        >
          {STATUS_LABEL[assignment.status]}
        </span>
      </div>

      {/* stats */}
      <dl className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-line-soft/60 p-3">
        <Stat label="Questions" value={isReady ? String(totalQuestions) : '—'} />
        <Stat label="Marks" value={String(totalMarks)} />
        <Stat label="Created" value={created} />
      </dl>

      {/* actions */}
      <div className="mt-5 flex items-center gap-2">
        {isReady ? (
          <Link
            href={`/output/${assignment._id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl bg-ink text-white text-[13px] font-medium hover:bg-ink/90 transition-colors"
          >
            <Eye className="w-4 h-4" strokeWidth={2} />
            View Paper
            <ArrowUpRight className="w-3.5 h-3.5 -mr-0.5 opacity-70" strokeWidth={2} />
          </Link>
        ) : (
          <div className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl bg-line-soft text-ink-muted text-[13px] font-medium">
            {assignment.status === 'failed' ? 'Generation failed' : 'Not ready yet'}
          </div>
        )}

        <IconAction
          label="Download PDF"
          icon={Download}
          onClick={downloadPdf}
          disabled={!isReady}
        />
        <IconAction
          label="Copy link"
          icon={LinkIcon}
          onClick={copyLink}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wide text-ink-muted truncate">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] font-semibold text-ink truncate">
        {value}
      </dd>
    </div>
  );
}

function IconAction({
  label,
  icon: Icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: typeof Download;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-surface-card border border-line text-ink-muted hover:text-ink hover:bg-line-soft disabled:opacity-40 disabled:hover:bg-surface-card disabled:hover:text-ink-muted transition-colors"
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
    </button>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

function sumMarksFromTypes(a: Assignment): number {
  return a.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);
}

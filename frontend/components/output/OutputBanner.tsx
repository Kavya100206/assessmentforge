'use client';

import { Download, RefreshCw } from 'lucide-react';
import type { Assignment } from '@/lib/types';

interface OutputBannerProps {
  assignment: Assignment;
  teacherName?: string;
  onDownload: () => void;
  onRegenerate: () => void;
  regenerating?: boolean;
}

export function OutputBanner({
  assignment,
  teacherName = 'John Doe',
  onDownload,
  onRegenerate,
  regenerating = false,
}: OutputBannerProps) {
  const out = assignment.generatedOutput;
  const className = out?.className ?? '';
  const subject = out?.subject ?? '';
  const topic = stripTrailingSuffix(assignment.title, [
    'practice paper',
    'question paper',
    'paper',
  ]);

  const lastRegen = lastRegeneratedLabel(assignment);

  return (
    <div className="print:hidden">
      <div className="bg-ink text-white rounded-2xl px-5 py-4 lg:px-6 lg:py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] lg:text-[14px] leading-relaxed text-white/90">
          Certainly,{' '}
          <span className="font-semibold text-white">{teacherName}!</span>{' '}
          Here are customized Question Paper for your{' '}
          {className && <span className="font-medium text-white">{className} </span>}
          {subject && <span className="font-medium text-white">{subject} </span>}
          classes on the{' '}
          <span className="font-medium text-white">{topic}</span> chapters:
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white/10 text-white text-[13px] font-medium hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`}
              strokeWidth={2}
            />
            {regenerating ? 'Regenerating…' : 'Regenerate'}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white text-ink text-[13px] font-medium hover:bg-white/90 transition-colors"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            Download as PDF
          </button>
        </div>
      </div>

      {lastRegen && (
        <p className="mt-2 text-[12px] text-ink-muted text-right">
          Last regenerated: {lastRegen}
        </p>
      )}
    </div>
  );
}

function stripTrailingSuffix(s: string, suffixes: string[]): string {
  let out = s.trim();
  for (const suf of suffixes) {
    const re = new RegExp(`\\s*[-:]?\\s*${suf}\\s*$`, 'i');
    out = out.replace(re, '').trim();
  }
  return out || s;
}

function lastRegeneratedLabel(a: Assignment): string | null {
  const created = new Date(a.createdAt).getTime();
  const updated = new Date(a.updatedAt).getTime();
  // Initial generation typically completes within seconds. Anything beyond
  // 2 minutes of drift between create and last update implies a regeneration.
  if (!Number.isFinite(created) || !Number.isFinite(updated)) return null;
  if (updated - created < 2 * 60 * 1000) return null;
  return relativeTime(updated);
}

function relativeTime(then: number): string {
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(then).toLocaleString();
}

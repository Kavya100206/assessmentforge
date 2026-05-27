'use client';

import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Library, ListChecks, BookOpen, Clock } from 'lucide-react';
import type { Assignment } from '@/lib/types';

interface LibraryInsightsProps {
  assignments: Assignment[];
  loading: boolean;
}

interface Metric {
  label: string;
  value: string;
  icon: LucideIcon;
  tint: string;
  title?: string;
}

export function LibraryInsights({ assignments, loading }: LibraryInsightsProps) {
  const metrics = useMemo<Metric[]>(() => computeMetrics(assignments), [assignments]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-card border border-line rounded-[20px] p-4 lg:p-5 animate-pulse h-[96px]"
          >
            <div className="w-9 h-9 rounded-lg bg-line-soft" />
            <div className="h-5 w-16 bg-line-soft rounded mt-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.label}
            className="bg-surface-card border border-line rounded-[20px] p-4 lg:p-5 flex items-start gap-3"
            title={m.title}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${m.tint}`}
            >
              <Icon className="w-[16px] h-[16px]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[18px] lg:text-[20px] font-bold text-ink leading-tight truncate">
                {m.value}
              </p>
              <p className="mt-0.5 text-[11px] lg:text-[12px] text-ink-muted truncate">
                {m.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function computeMetrics(all: Assignment[]): Metric[] {
  const completed = all.filter((a) => a.status === 'completed' && a.generatedOutput);

  const totalAssessments = completed.length;
  const totalQuestions = completed.reduce(
    (s, a) => s + (a.generatedOutput?.sections.reduce((ss, sec) => ss + sec.questions.length, 0) ?? 0),
    0
  );

  // mode of subjects
  const subjectCounts = new Map<string, number>();
  for (const a of completed) {
    const s = a.generatedOutput?.subject?.trim();
    if (s) subjectCounts.set(s, (subjectCounts.get(s) ?? 0) + 1);
  }
  let mostUsed = '—';
  let max = 0;
  subjectCounts.forEach((v, k) => {
    if (v > max) {
      mostUsed = k;
      max = v;
    }
  });

  // latest generated
  const latest = completed
    .map((a) => new Date(a.updatedAt).getTime())
    .sort((a, b) => b - a)[0];
  const latestLabel = latest ? relativeTime(latest) : '—';
  const latestTitle = latest ? new Date(latest).toLocaleString() : undefined;

  return [
    {
      label: 'Total Assessments',
      value: String(totalAssessments),
      icon: Library,
      tint: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Questions Generated',
      value: String(totalQuestions),
      icon: ListChecks,
      tint: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Most Used Subject',
      value: mostUsed,
      icon: BookOpen,
      tint: 'bg-violet-100 text-violet-700',
    },
    {
      label: 'Latest Generated',
      value: latestLabel,
      icon: Clock,
      tint: 'bg-amber-100 text-amber-700',
      title: latestTitle,
    },
  ];
}

function relativeTime(then: number): string {
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(then).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

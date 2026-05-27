'use client';

import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileCheck2, ListChecks, Gauge, BookOpen } from 'lucide-react';
import type { Assignment, Difficulty } from '@/lib/types';

interface StatsGridProps {
  assignments: Assignment[];
  loading: boolean;
}

interface Stat {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tint: string;
}

export function StatsGrid({ assignments, loading }: StatsGridProps) {
  const stats = useMemo<Stat[]>(() => computeStats(assignments), [assignments]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-card border border-line rounded-[20px] p-5 animate-pulse h-[124px]"
          >
            <div className="w-10 h-10 rounded-xl bg-line-soft" />
            <div className="h-6 w-16 bg-line-soft rounded mt-4" />
            <div className="h-3 w-24 bg-line-soft rounded mt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {stats.map((s) => (
        <StatCard key={s.label} stat={s} />
      ))}
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <div className="bg-surface-card border border-line rounded-[20px] p-5 flex flex-col justify-between min-h-[124px]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.tint}`}>
        <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
      </div>
      <div className="mt-4">
        <p className="text-[24px] lg:text-[28px] font-bold text-ink leading-none">
          {stat.value}
        </p>
        <p className="mt-1.5 text-[12px] lg:text-[13px] text-ink-muted">
          {stat.label}
        </p>
        {stat.hint && (
          <p className="mt-0.5 text-[11px] text-ink-subtle">{stat.hint}</p>
        )}
      </div>
    </div>
  );
}

function computeStats(all: Assignment[]): Stat[] {
  const completed = all.filter((a) => a.status === 'completed' && a.generatedOutput);

  const generatedCount = completed.length;

  const allQuestions = completed.flatMap(
    (a) => a.generatedOutput?.sections.flatMap((s) => s.questions) ?? []
  );
  const totalQuestions = allQuestions.length;

  const difficultyCounts: Record<Difficulty, number> = {
    Easy: 0,
    Moderate: 0,
    Challenging: 0,
  };
  for (const q of allQuestions) difficultyCounts[q.difficulty] += 1;
  const mode = (Object.entries(difficultyCounts) as [Difficulty, number][])
    .sort((a, b) => b[1] - a[1])[0];
  const dominantDifficulty: string =
    totalQuestions === 0 ? '—' : mode[0];

  const subjects = new Set<string>();
  for (const a of completed) {
    const s = a.generatedOutput?.subject?.trim();
    if (s) subjects.add(s);
  }

  return [
    {
      label: 'Assignments Generated',
      value: String(generatedCount),
      hint: generatedCount === 0 ? 'No papers yet' : 'Across all subjects',
      icon: FileCheck2,
      tint: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Questions Generated',
      value: String(totalQuestions),
      hint:
        totalQuestions === 0
          ? 'Create your first paper'
          : `${Math.round(totalQuestions / Math.max(1, generatedCount))} per paper avg`,
      icon: ListChecks,
      tint: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Average Difficulty',
      value: dominantDifficulty,
      hint:
        totalQuestions === 0
          ? 'Awaiting data'
          : `${difficultyCounts.Easy} · ${difficultyCounts.Moderate} · ${difficultyCounts.Challenging}`,
      icon: Gauge,
      tint: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Active Subjects',
      value: String(subjects.size),
      hint:
        subjects.size === 0
          ? 'None yet'
          : Array.from(subjects).slice(0, 2).join(', ') +
            (subjects.size > 2 ? ` +${subjects.size - 2}` : ''),
      icon: BookOpen,
      tint: 'bg-violet-100 text-violet-700',
    },
  ];
}

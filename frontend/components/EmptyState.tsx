'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { EmptyIllustration } from './brand/EmptyIllustration';

export function EmptyState() {
  return (
    <div className="bg-surface-card border border-line rounded-3xl px-8 pt-12 pb-16 lg:px-12 lg:pt-14 lg:pb-20 min-h-[560px] lg:min-h-[640px] flex flex-col items-center text-center">
      <EmptyIllustration className="mb-8 w-[250px] h-auto" />
      <h2 className="text-[28px] lg:text-[36px] font-bold text-ink leading-tight mb-3">
        No assignments yet
      </h2>
      <p className="max-w-[360px] mx-auto text-[15px] lg:text-[16px] font-normal text-ink-muted leading-relaxed mb-8">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>
      <Link
        href="/assignments/create"
        className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-ink text-white text-[14px] font-medium hover:bg-ink/90 transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        <span>Create Your First Assignment</span>
      </Link>
    </div>
  );
}

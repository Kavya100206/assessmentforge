import Link from 'next/link';
import { Plus } from 'lucide-react';
import { LibraryIllustration } from '@/components/brand/LibraryIllustration';

export function LibraryEmptyState() {
  return (
    <div className="bg-surface-card border border-line rounded-3xl px-6 py-12 lg:py-16 flex flex-col items-center text-center">
      <LibraryIllustration className="w-[220px] lg:w-[260px] h-auto" />
      <h2 className="mt-6 text-[26px] lg:text-[32px] font-bold text-ink leading-tight">
        Your library is empty
      </h2>
      <p className="mt-3 max-w-[420px] text-[14px] lg:text-[15px] text-ink-muted leading-relaxed">
        Generated assessments will appear here and can be reused anytime.
      </p>
      <Link
        href="/assignments/create"
        className="mt-7 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-ink text-white text-[14px] font-medium hover:bg-ink/90 transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Create Assignment
      </Link>
    </div>
  );
}

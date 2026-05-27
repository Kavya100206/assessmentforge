import Link from 'next/link';
import { ArrowUpRight, Plus, FolderOpen } from 'lucide-react';

export function QuickActions() {
  return (
    <section>
      <h2 className="text-[16px] lg:text-[17px] font-semibold text-ink mb-3">
        Quick actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
        <Link
          href="/assignments/create"
          className="group relative overflow-hidden bg-ink text-white rounded-[20px] p-5 lg:p-6 flex items-start gap-4 hover:bg-ink/95 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] lg:text-[16px] font-semibold">
              Create Assignment
            </p>
            <p className="mt-1 text-[13px] text-white/70 leading-relaxed">
              Generate a new question paper from source material or instructions.
            </p>
          </div>
          <ArrowUpRight
            className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            strokeWidth={2}
          />
        </Link>

        <Link
          href="/assignments"
          className="group bg-surface-card border border-line rounded-[20px] p-5 lg:p-6 flex items-start gap-4 hover:bg-line-soft transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-line-soft text-ink flex items-center justify-center shrink-0 group-hover:bg-white">
            <FolderOpen className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] lg:text-[16px] font-semibold text-ink">
              View Assignments
            </p>
            <p className="mt-1 text-[13px] text-ink-muted leading-relaxed">
              Browse, search, and manage every paper you&apos;ve generated.
            </p>
          </div>
          <ArrowUpRight
            className="w-5 h-5 text-ink-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            strokeWidth={2}
          />
        </Link>
      </div>
    </section>
  );
}

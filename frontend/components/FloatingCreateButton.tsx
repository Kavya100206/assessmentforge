'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export function FloatingCreateButton() {
  return (
    <div className="fixed bottom-6 lg:bottom-8 inset-x-0 z-30 flex justify-center pointer-events-none">
      <Link
        href="/assignments/create"
        className="pointer-events-auto inline-flex items-center gap-2 h-12 px-5 rounded-pill bg-ink text-white text-[14px] font-medium shadow-floating hover:bg-ink/90 transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        <span>Create Assignment</span>
      </Link>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Trash2, Eye } from 'lucide-react';
import type { Assignment } from '@/lib/types';

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

function formatDate(d: string): string {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="group relative bg-surface-card border border-line rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-2">
        <Link
          href={`/output/${assignment._id}`}
          className="flex-1 min-w-0"
        >
          <h3 className="text-[15px] font-semibold text-ink truncate">
            {assignment.title}
          </h3>
        </Link>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-ink-muted hover:bg-line-soft hover:text-ink transition-colors"
            aria-label="Open menu"
          >
            <MoreVertical className="w-4 h-4" strokeWidth={2} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 bg-surface-card border border-line rounded-lg shadow-floating overflow-hidden">
              <Link
                href={`/output/${assignment._id}`}
                className="flex items-center gap-2 px-3 py-2.5 text-[13px] text-ink hover:bg-line-soft transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Eye className="w-4 h-4 text-ink-muted" strokeWidth={1.8} />
                View Assignment
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(assignment._id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-accent hover:bg-accent/5 transition-colors"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[12px] text-ink-muted">
        <span>
          Assigned on : <span className="text-ink">{formatDate(assignment.createdAt)}</span>
        </span>
        <span>
          Due : <span className="text-ink">{formatDate(assignment.dueDate)}</span>
        </span>
      </div>
    </div>
  );
}

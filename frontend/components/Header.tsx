'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ChevronDown, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  breadcrumb?: string;
  showBack?: boolean;
}

export function Header({ breadcrumb = 'Assignment', showBack = true }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-surface-page/80 backdrop-blur-md border-b border-line">
      <div className="flex items-center h-[80px] pt-2 px-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-line-soft text-ink-muted hover:text-ink transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          {/* breadcrumb pill */}
          <div className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-surface-card border border-line text-[13px] text-ink-muted">
            <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="text-ink font-medium">{breadcrumb}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <button
            type="button"
            className="relative w-10 h-10 inline-flex items-center justify-center rounded-full hover:bg-line-soft text-ink-muted hover:text-ink transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" strokeWidth={1.8} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent ring-2 ring-surface-page" />
          </button>

          <Link
            href="/profile"
            className="flex items-center gap-3 pl-1 pr-3 h-10 rounded-full hover:bg-line-soft transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-[13px] font-semibold text-orange-700">
              JD
            </div>
            <span className="hidden sm:inline text-[14px] font-medium text-ink">
              John Doe
            </span>
            <ChevronDown className="hidden sm:inline w-4 h-4 text-ink-muted" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}

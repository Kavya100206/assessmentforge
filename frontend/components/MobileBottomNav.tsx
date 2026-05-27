'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, BookOpenText, Bookmark, Sparkles } from 'lucide-react';

const items = [
  { label: 'Home', href: '/', icon: LayoutGrid },
  { label: 'Assignments', href: '/assignments', icon: BookOpenText },
  { label: 'Library', href: '/library', icon: Bookmark },
  { label: 'AI Toolkit', href: '/ai-toolkit', icon: Sparkles },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-card border-t border-line">
      <ul className="flex items-stretch justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 h-full text-[11px] font-medium transition-colors ${
                  active ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                <span
                  className={`relative inline-flex items-center justify-center w-10 h-7 rounded-full ${
                    active ? 'bg-line-soft' : ''
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                  {active && (
                    <span className="absolute -top-0.5 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

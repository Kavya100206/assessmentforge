'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  Users,
  BookOpenText,
  Sparkles,
  Bookmark,
  Settings,
  Plus,
} from 'lucide-react';
import { Logo } from './brand/Logo';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: LayoutGrid },
  { label: 'My Groups', href: '/groups', icon: Users },
  { label: 'Assignments', href: '/assignments', icon: BookOpenText, badge: 10 },
  { label: "AI Teacher's Toolkit", href: '/ai-toolkit', icon: Sparkles },
  { label: 'My Library', href: '/library', icon: Bookmark },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[304px] min-w-[304px] max-w-[304px] shrink-0 flex-col bg-surface-sidebar border-r border-line z-30">
      {/* Logo */}
      <div className="px-6 pt-4 pb-3">
        <Logo />
      </div>

      {/* Create Assignment — solid dark, full-width */}
      <div className="px-6">
        <Link
          href="/assignments/create"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-ink text-white text-[14px] font-medium hover:bg-ink/90 transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Create Assignment</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 mt-5">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 h-10 px-3 rounded-lg text-[14px] font-medium transition-colors ${
                active
                  ? 'bg-line-soft text-ink'
                  : 'text-ink-muted hover:bg-line-soft/60 hover:text-ink'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className="min-w-[18px] h-[18px] px-1.5 inline-flex items-center justify-center rounded-full bg-badge text-white text-[10px] font-semibold leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Settings + school profile */}
      <div className="px-4 pb-5 pt-4 space-y-3 border-t-2 border-line">
        <Link
          href="/settings"
          className="flex items-center gap-3 h-10 px-3 rounded-lg text-[14px] font-medium text-ink-muted hover:bg-line-soft/60 hover:text-ink transition-colors"
        >
          <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
          <span>Settings</span>
        </Link>

        <div className="flex items-center gap-3 p-5 rounded-2xl border border-line">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-[16px] font-semibold text-orange-700 shrink-0">
            D
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-ink truncate">
              Delhi Public School
            </p>
            <p className="text-[12px] text-ink-muted truncate">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

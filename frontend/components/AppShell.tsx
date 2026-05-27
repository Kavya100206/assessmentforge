import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumb?: string;
}

export function AppShell({ children, breadcrumb }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-page">
      <Sidebar />
      <div className="lg:pl-[304px]">
        <Header breadcrumb={breadcrumb} />
        <main className="pb-24 lg:pb-12">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

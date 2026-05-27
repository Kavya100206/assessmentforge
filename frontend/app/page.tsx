'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { WelcomeSection } from '@/components/home/WelcomeSection';
import { StatsGrid } from '@/components/home/StatsGrid';
import { QuickActions } from '@/components/home/QuickActions';
import { RecentAssignments } from '@/components/home/RecentAssignments';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getSocket } from '@/lib/socket';

export default function HomePage() {
  const { assignments, loading, fetched, fetchAssignments } = useAssignmentStore();
  const [liveConnected, setLiveConnected] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Real-time: refetch when any assignment is created / completed / deleted
  useEffect(() => {
    const socket = getSocket();

    const setConnected = () => setLiveConnected(true);
    const setDisconnected = () => setLiveConnected(false);
    setLiveConnected(socket.connected);

    socket.on('connect', setConnected);
    socket.on('disconnect', setDisconnected);

    const onUpdated = () => {
      fetchAssignments();
    };
    socket.on('assignment:updated', onUpdated);

    return () => {
      socket.off('connect', setConnected);
      socket.off('disconnect', setDisconnected);
      socket.off('assignment:updated', onUpdated);
    };
  }, [fetchAssignments]);

  // Refetch when the user returns to the tab
  useEffect(() => {
    const onFocus = () => fetchAssignments();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchAssignments();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchAssignments]);

  const initialLoading = !fetched && loading;

  return (
    <AppShell breadcrumb="Home">
      <div className="px-6 pt-6 space-y-7 lg:space-y-9">
        <WelcomeSection name="John" live={liveConnected} />
        <StatsGrid assignments={assignments} loading={initialLoading} />
        <QuickActions />
        <RecentAssignments assignments={assignments} loading={initialLoading} />
      </div>
    </AppShell>
  );
}

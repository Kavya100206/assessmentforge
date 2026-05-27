'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { OutputBanner } from '@/components/output/OutputBanner';
import { QuestionPaper } from '@/components/output/QuestionPaper';
import { GeneratingOverlay } from '@/components/form/GeneratingOverlay';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { Assignment } from '@/lib/types';

interface RegenState {
  active: boolean;
  stage: string;
  progress: number;
  error: string | null;
}

export default function OutputPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoDownload = searchParams?.get('download') === '1';
  const printedRef = useRef(false);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regen, setRegen] = useState<RegenState>({
    active: false,
    stage: 'starting',
    progress: 0,
    error: null,
  });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { assignment } = await api.getAssignment(id);
      setAssignment(assignment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // If still processing, listen for completion
  useEffect(() => {
    if (!id || !assignment) return;
    if (assignment.status !== 'pending' && assignment.status !== 'processing') return;

    const socket = getSocket();
    const join = () => socket.emit('join', id);
    if (socket.connected) join();
    else socket.once('connect', join);

    const onComplete = (p: { assignmentId: string }) => {
      if (p.assignmentId !== id) return;
      load();
    };
    const onErr = (p: { assignmentId: string; error: string }) => {
      if (p.assignmentId !== id) return;
      setError(p.error);
      setAssignment((a) => (a ? { ...a, status: 'failed' } : a));
    };

    socket.on('generation:complete', onComplete);
    socket.on('generation:error', onErr);
    return () => {
      socket.off('generation:complete', onComplete);
      socket.off('generation:error', onErr);
    };
  }, [id, assignment, load]);

  const onDownload = () => {
    window.print();
  };

  const onRegenerate = useCallback(async () => {
    if (!id || regen.active) return;
    setRegen({ active: true, stage: 'starting', progress: 5, error: null });

    const socket = getSocket();
    const join = () => socket.emit('join', id);
    if (socket.connected) join();
    else socket.once('connect', join);

    const onProgress = (p: { assignmentId: string; stage: string; progress: number }) => {
      if (p.assignmentId !== id) return;
      setRegen((r) => ({ ...r, stage: p.stage, progress: p.progress }));
    };
    const onComplete = (p: { assignmentId: string }) => {
      if (p.assignmentId !== id) return;
      cleanup();
      load().finally(() => {
        setRegen({ active: false, stage: 'starting', progress: 0, error: null });
        router.replace(`/output/${id}`);
      });
    };
    const onErr = (p: { assignmentId: string; error: string }) => {
      if (p.assignmentId !== id) return;
      cleanup();
      setRegen((r) => ({ ...r, error: p.error }));
    };
    function cleanup() {
      socket.off('generation:progress', onProgress);
      socket.off('generation:complete', onComplete);
      socket.off('generation:error', onErr);
    }
    socket.on('generation:progress', onProgress);
    socket.on('generation:complete', onComplete);
    socket.on('generation:error', onErr);

    try {
      await api.regenerateAssignment(id);
    } catch (err) {
      cleanup();
      setRegen((r) => ({
        ...r,
        error: err instanceof Error ? err.message : 'Failed to regenerate',
      }));
    }
  }, [id, regen.active, load, router]);

  const dismissRegen = () =>
    setRegen({ active: false, stage: 'starting', progress: 0, error: null });

  // Auto-trigger print once the paper is rendered, if arrived via ?download=1
  useEffect(() => {
    if (!autoDownload || printedRef.current) return;
    if (!assignment || assignment.status !== 'completed' || !assignment.generatedOutput) return;
    printedRef.current = true;
    const id = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(id);
  }, [autoDownload, assignment]);

  return (
    <AppShell breadcrumb="Assignment">
      <div className="px-6 pt-6 print:p-0">
        {loading && <SkeletonPaper />}

        {!loading && error && (
          <StateCard
            icon={<AlertCircle className="w-7 h-7" strokeWidth={1.8} />}
            tint="error"
            title="Could not load this assignment"
            body={error}
            cta={
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center h-11 px-5 rounded-xl bg-ink text-white text-[14px] font-medium hover:bg-ink/90 transition-colors"
              >
                Try again
              </button>
            }
          />
        )}

        {!loading && !error && assignment && assignment.status === 'failed' && (
          <StateCard
            icon={<AlertCircle className="w-7 h-7" strokeWidth={1.8} />}
            tint="error"
            title="Generation failed"
            body="The AI couldn't generate a question paper for this assignment. You can try creating it again from the dashboard."
            cta={
              <Link
                href="/assignments"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-white text-[14px] font-medium hover:bg-ink/90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                Back to assignments
              </Link>
            }
          />
        )}

        {!loading &&
          !error &&
          assignment &&
          (assignment.status === 'pending' || assignment.status === 'processing') && (
            <StateCard
              icon={<Sparkles className="w-7 h-7 animate-pulse" strokeWidth={1.8} />}
              tint="info"
              title="Still generating your question paper"
              body="This usually takes 10–30 seconds. The page will update automatically when it's ready."
            />
          )}

        {!loading &&
          !error &&
          assignment &&
          assignment.status === 'completed' &&
          assignment.generatedOutput && (
            <div className="space-y-5">
              <OutputBanner
                assignment={assignment}
                onDownload={onDownload}
                onRegenerate={onRegenerate}
                regenerating={regen.active}
              />
              <QuestionPaper output={assignment.generatedOutput} />

              <div className="flex justify-center pt-4 print:hidden">
                <button
                  type="button"
                  onClick={() => router.push('/assignments')}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-surface-card border border-line text-[13px] font-medium text-ink hover:bg-line-soft transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                  Back to assignments
                </button>
              </div>
            </div>
          )}
      </div>

      {regen.active && (
        <GeneratingOverlay
          stage={regen.stage}
          progress={regen.progress}
          error={regen.error}
          onCancel={dismissRegen}
        />
      )}
    </AppShell>
  );
}

function SkeletonPaper() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-20 rounded-2xl bg-line" />
      <div className="bg-surface-card border border-line rounded-3xl px-6 py-10 lg:px-12 lg:py-12 space-y-4">
        <div className="h-7 w-2/3 mx-auto rounded bg-line-soft" />
        <div className="h-4 w-1/3 mx-auto rounded bg-line-soft" />
        <div className="h-4 w-1/4 mx-auto rounded bg-line-soft" />
        <div className="h-px bg-line my-6" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-line-soft" />
        ))}
      </div>
    </div>
  );
}

interface StateCardProps {
  icon: React.ReactNode;
  tint: 'info' | 'error';
  title: string;
  body: string;
  cta?: React.ReactNode;
}

function StateCard({ icon, tint, title, body, cta }: StateCardProps) {
  const tintClass =
    tint === 'error' ? 'bg-accent/10 text-accent' : 'bg-ink text-white';
  return (
    <div className="bg-surface-card border border-line rounded-3xl px-8 py-16 text-center">
      <div
        className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${tintClass}`}
      >
        {icon}
      </div>
      <h2 className="text-[22px] font-bold text-ink mb-2">{title}</h2>
      <p className="max-w-md mx-auto text-[14px] text-ink-muted mb-8">{body}</p>
      {cta}
    </div>
  );
}

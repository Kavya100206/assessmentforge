'use client';

import { Sparkles, AlertCircle } from 'lucide-react';

interface GeneratingOverlayProps {
  stage: string;
  progress: number;
  error: string | null;
  onCancel?: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  starting: 'Getting started',
  reading_source: 'Reading source material',
  calling_llm: 'Asking the AI to draft questions',
  retrying_llm: 'Retrying — almost there',
  storing: 'Saving your question paper',
};

export function GeneratingOverlay({ stage, progress, error, onCancel }: GeneratingOverlayProps) {
  const label = STAGE_LABELS[stage] ?? 'Working on it';

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {!error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-ink text-white flex items-center justify-center">
              <Sparkles className="w-7 h-7 animate-pulse" strokeWidth={1.8} />
            </div>
            <h2 className="text-[24px] font-bold text-ink mb-2">
              Generating your question paper
            </h2>
            <p className="text-[14px] text-ink-muted mb-8">
              This usually takes 10–30 seconds. You can leave this page open.
            </p>
            <div className="h-2 w-full rounded-full bg-line overflow-hidden mb-3">
              <div
                className="h-full bg-ink transition-all duration-500 ease-out"
                style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
              />
            </div>
            <p className="text-[13px] font-medium text-ink">{label}</p>
            <p className="text-[12px] text-ink-muted mt-1">{progress}%</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
              <AlertCircle className="w-7 h-7" strokeWidth={1.8} />
            </div>
            <h2 className="text-[24px] font-bold text-ink mb-2">
              Something went wrong
            </h2>
            <p className="text-[14px] text-ink-muted mb-8">{error}</p>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center h-11 px-5 rounded-xl bg-ink text-white text-[14px] font-medium hover:bg-ink/90 transition-colors"
              >
                Try again
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

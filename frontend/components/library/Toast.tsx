'use client';

import { useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({ message, onDismiss, durationMs = 2200 }: ToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [onDismiss, durationMs]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 print:hidden">
      <div className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-xl bg-ink text-white shadow-floating animate-[toast-in_180ms_ease-out]">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/90">
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
        <span className="text-[13px] font-medium">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
      <style jsx>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translate(-50%, 12px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}

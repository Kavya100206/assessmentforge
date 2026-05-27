'use client';

import { useEffect, useState } from 'react';

interface WelcomeSectionProps {
  name?: string;
  live?: boolean;
}

export function WelcomeSection({ name = 'John', live = false }: WelcomeSectionProps) {
  const [greeting, setGreeting] = useState(greetingFor(new Date()));

  useEffect(() => {
    // Update if the page sits idle across the hour
    const id = window.setInterval(() => {
      setGreeting(greetingFor(new Date()));
    }, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section>
      <div className="flex items-center gap-2">
        <span
          className={`relative inline-flex w-2 h-2 rounded-full ${
            live ? 'bg-emerald-500' : 'bg-ink/30'
          }`}
        >
          {live && (
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
          )}
        </span>
        <p className="text-[13px] text-ink-muted">
          {live ? 'Live' : 'Offline'} · {formatToday(new Date())}
        </p>
      </div>
      <h1 className="mt-2 text-[24px] lg:text-[32px] font-bold text-ink leading-tight">
        {greeting}, {name}
      </h1>
      <p className="mt-2 max-w-xl text-[14px] lg:text-[15px] text-ink-muted leading-relaxed">
        Spin up a full question paper in seconds. Upload source material, pick
        the question mix, and let the AI handle the rest.
      </p>
    </section>
  );
}

function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 22) return 'Good evening';
  return 'Good night';
}

function formatToday(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

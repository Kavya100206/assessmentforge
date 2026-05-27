'use client';

import { useState, FormEvent } from 'react';
import { Bell, Check, Users, Share2, MessageSquare } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { GroupsIllustration } from '@/components/brand/GroupsIllustration';

export default function GroupsPage() {
  return (
    <AppShell breadcrumb="Teacher Groups">
      <div className="px-6 pt-6 pb-12 max-w-5xl mx-auto">
        <HeroCard />
        <UpcomingFeatures />
      </div>
    </AppShell>
  );
}

function HeroCard() {
  return (
    <section className="bg-surface-card border border-line rounded-3xl px-6 py-10 lg:px-12 lg:py-14 text-center flex flex-col items-center">
      <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        Coming soon
      </span>

      <GroupsIllustration className="mt-6" />

      <h1 className="mt-2 text-[28px] lg:text-[36px] font-bold text-ink leading-tight">
        Teacher Groups
      </h1>
      <p className="mt-3 max-w-[480px] mx-auto text-[14px] lg:text-[16px] text-ink-muted leading-relaxed">
        Organize your classes, share question banks with colleagues, and
        collaborate on assessments — all in one shared workspace. We&apos;re
        building it now.
      </p>

      <NotifyMeForm />
    </section>
  );
}

function NotifyMeForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      setState('error');
      return;
    }
    setState('submitting');
    // No backend endpoint yet — we just remember locally so the UI feels real.
    window.setTimeout(() => {
      try {
        const list = JSON.parse(
          localStorage.getItem('vedaai:groups-waitlist') ?? '[]'
        ) as string[];
        if (!list.includes(trimmed)) list.push(trimmed);
        localStorage.setItem('vedaai:groups-waitlist', JSON.stringify(list));
      } catch {
        // ignore storage errors
      }
      setState('done');
    }, 400);
  };

  if (state === 'done') {
    return (
      <div className="mt-7 inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-emerald-50 text-emerald-700 text-[14px] font-medium">
        <Check className="w-4 h-4" strokeWidth={2.5} />
        You&apos;re on the list. We&apos;ll email <strong className="font-semibold">{email}</strong> at launch.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-7 w-full max-w-md mx-auto flex flex-col sm:flex-row items-stretch gap-2"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === 'error') setState('idle');
        }}
        placeholder="you@school.edu"
        autoComplete="email"
        className="flex-1 h-12 px-4 rounded-xl bg-surface-card border border-line text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/30 transition-colors"
      />
      <button
        type="submit"
        disabled={state === 'submitting'}
        className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-ink text-white text-[14px] font-medium hover:bg-ink/90 disabled:opacity-60 transition-colors shrink-0"
      >
        <Bell className="w-4 h-4" strokeWidth={2} />
        {state === 'submitting' ? 'Saving…' : 'Notify Me When Available'}
      </button>
      {error && (
        <p className="sm:absolute sm:translate-y-14 text-[12px] text-accent mt-1 sm:mt-0">
          {error}
        </p>
      )}
    </form>
  );
}

function UpcomingFeatures() {
  const features = [
    {
      icon: Users,
      title: 'Class rosters',
      body: 'Group your students by class or subject and assign papers in bulk.',
    },
    {
      icon: Share2,
      title: 'Shared question bank',
      body: 'Curate and re-use questions across your school’s teaching team.',
    },
    {
      icon: MessageSquare,
      title: 'Co-review',
      body: 'Comment on generated papers and approve edits before they ship.',
    },
  ];

  return (
    <section className="mt-8">
      <h2 className="text-[13px] font-semibold text-ink-muted uppercase tracking-wide mb-3">
        What&apos;s coming
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="bg-surface-card border border-line rounded-[20px] p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-line-soft text-ink flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </div>
              <p className="mt-4 text-[15px] font-semibold text-ink">{f.title}</p>
              <p className="mt-1 text-[13px] text-ink-muted leading-relaxed">
                {f.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

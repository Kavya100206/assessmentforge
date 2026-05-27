import type { LucideIcon } from 'lucide-react';
import {
  BookText,
  ClipboardList,
  Layers,
  Gauge,
  Sparkles,
  Lock,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';

interface Tool {
  title: string;
  description: string;
  icon: LucideIcon;
  tint: string;
}

const TOOLS: Tool[] = [
  {
    title: 'Lesson Summary Generator',
    description:
      'Turn any textbook chapter into a concise, student-ready summary with key takeaways and definitions.',
    icon: BookText,
    tint: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Rubric Generator',
    description:
      'Draft fair, criterion-based grading rubrics for essays, projects, and presentations in seconds.',
    icon: ClipboardList,
    tint: 'bg-sky-100 text-sky-700',
  },
  {
    title: "Bloom's Taxonomy Assistant",
    description:
      'Map your questions to cognitive levels and rebalance them across Remember, Apply, Analyze, and Create.',
    icon: Layers,
    tint: 'bg-violet-100 text-violet-700',
  },
  {
    title: 'Question Difficulty Analyzer',
    description:
      'Score a paper for difficulty distribution and get suggestions to keep it well-balanced.',
    icon: Gauge,
    tint: 'bg-amber-100 text-amber-700',
  },
];

export default function AiToolkitPage() {
  return (
    <AppShell breadcrumb="AI Toolkit">
      <div className="px-6 pt-6 pb-12 space-y-7 lg:space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <header>
          <h1 className="text-[22px] lg:text-[28px] font-bold text-ink leading-tight">
            AI Teacher Toolkit
          </h1>
          <p className="mt-1.5 text-[13px] lg:text-[14px] text-ink-muted max-w-2xl">
            AI-powered tools to help teachers create, organize, and improve
            learning materials.
          </p>
        </header>

        {/* Tool grid */}
        <section>
          <h2 className="text-[13px] font-semibold text-ink-muted uppercase tracking-wide mb-3">
            Available tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {TOOLS.map((t) => (
              <ToolCard key={t.title} tool={t} />
            ))}
          </div>
        </section>

        {/* Featured section */}
        <FeaturedSection />
      </div>
    </AppShell>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <article className="group bg-surface-card border border-line rounded-[20px] p-5 lg:p-6 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tool.tint}`}>
          <Icon className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-accent/10 text-accent text-[10.5px] font-semibold uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Coming soon
        </span>
      </div>

      <h3 className="mt-5 text-[16px] lg:text-[17px] font-semibold text-ink">
        {tool.title}
      </h3>
      <p className="mt-1.5 text-[13px] lg:text-[14px] text-ink-muted leading-relaxed">
        {tool.description}
      </p>

      <div className="mt-6 pt-5 border-t border-line">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-line-soft text-ink-muted text-[13px] font-medium cursor-not-allowed"
        >
          <Lock className="w-3.5 h-3.5" strokeWidth={2} />
          Launch
        </button>
      </div>
    </article>
  );
}

function FeaturedSection() {
  const upcoming = [
    'Lesson Plan Builder',
    'Worksheet Generator',
    'Reading-Level Adjuster',
    'Multilingual Translator',
    'Citation Helper',
  ];

  return (
    <section className="relative overflow-hidden bg-ink text-white rounded-3xl px-6 py-8 lg:px-10 lg:py-10">
      {/* soft gradient blob */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, #FF7A3D 0%, #E91E63 50%, transparent 75%)',
        }}
      />

      <div className="relative flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10">
        <div className="lg:max-w-md">
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-white/10 text-white text-[11px] font-semibold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
            Roadmap
          </div>
          <h2 className="mt-4 text-[22px] lg:text-[26px] font-bold leading-tight">
            More AI tools are coming soon
          </h2>
          <p className="mt-3 text-[13px] lg:text-[14px] text-white/70 leading-relaxed">
            VedaAI is expanding beyond assessment generation. We&apos;re building
            a full teacher toolkit — from lesson planning to differentiated
            instruction — so every part of your prep can move faster.
          </p>
        </div>

        <div className="lg:flex-1">
          <p className="text-[11px] uppercase tracking-wide text-white/50 font-semibold mb-3">
            On the roadmap
          </p>
          <ul className="flex flex-wrap gap-2">
            {upcoming.map((u) => (
              <li
                key={u}
                className="inline-flex items-center h-8 px-3 rounded-full bg-white/10 text-white/85 text-[12px] font-medium border border-white/10"
              >
                {u}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

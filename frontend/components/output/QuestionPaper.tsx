import type { GeneratedOutput } from '@/lib/types';
import { DifficultyBadge } from './DifficultyBadge';

interface QuestionPaperProps {
  output: GeneratedOutput;
}

export function QuestionPaper({ output }: QuestionPaperProps) {
  return (
    <article
      id="question-paper"
      className="bg-surface-card border border-line rounded-3xl px-6 py-8 lg:px-12 lg:py-12 text-ink print:rounded-none print:border-none print:p-0"
    >
      {/* School name */}
      <header className="text-center">
        <h1 className="text-[20px] lg:text-[24px] font-bold leading-tight">
          {output.schoolName || 'School Name'}
        </h1>
        <p className="mt-2 text-[14px] lg:text-[15px]">
          Subject: <span className="font-medium">{output.subject}</span>
        </p>
        <p className="text-[14px] lg:text-[15px]">
          Class: <span className="font-medium">{output.className}</span>
        </p>
      </header>

      {/* Time + Marks */}
      <div className="mt-8 flex items-center justify-between text-[13px] lg:text-[14px]">
        <span>
          Time Allowed:{' '}
          <span className="font-medium">{output.timeAllowed} minutes</span>
        </span>
        <span>
          Maximum Marks:{' '}
          <span className="font-medium">{output.maxMarks}</span>
        </span>
      </div>

      {/* Instructions */}
      <p className="mt-4 text-[13px] italic text-ink-muted">
        All questions are compulsory unless stated otherwise.
      </p>

      {/* Student info */}
      <div className="mt-6 space-y-2.5 text-[13px] lg:text-[14px]">
        <div className="flex items-end gap-3">
          <span>Name:</span>
          <span className="flex-1 border-b border-dotted border-ink/40 h-4" />
        </div>
        <div className="flex items-end gap-3">
          <span>Roll Number:</span>
          <span className="flex-1 border-b border-dotted border-ink/40 h-4" />
        </div>
        <div className="flex items-end gap-3">
          <span>Class: {output.className}</span>
          <span className="ml-4">Section:</span>
          <span className="w-28 border-b border-dotted border-ink/40 h-4" />
        </div>
      </div>

      {/* Sections */}
      <div className="mt-10 space-y-10">
        {output.sections.map((section, i) => (
          <section key={i}>
            <header className="text-center">
              <h2 className="text-[15px] lg:text-[16px] font-semibold">
                {section.title}
              </h2>
              <p className="mt-1 text-[13px] lg:text-[14px] font-medium">
                {section.type}
              </p>
              {section.instruction && (
                <p className="mt-1 text-[12px] lg:text-[13px] text-ink-muted">
                  {section.instruction}
                </p>
              )}
            </header>

            <ol className="mt-5 space-y-3">
              {section.questions.map((q) => (
                <li
                  key={q.number}
                  className="flex gap-2 text-[13px] lg:text-[14px] leading-relaxed"
                >
                  <span className="font-medium shrink-0">{q.number}.</span>
                  <span className="flex-1">
                    <DifficultyBadge difficulty={q.difficulty} />{' '}
                    <span>{q.text}</span>{' '}
                    <span className="text-ink-muted whitespace-nowrap">
                      [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <p className="mt-12 text-center text-[13px] font-medium text-ink-muted">
        End of Question Paper
      </p>

      {/* Answer key */}
      {output.answerKey.length > 0 && (
        <section className="mt-12 pt-8 border-t border-line">
          <h2 className="text-[16px] lg:text-[18px] font-semibold mb-4">
            Answer Key:
          </h2>
          <ol className="space-y-3">
            {output.answerKey.map((a) => (
              <li
                key={a.number}
                className="flex gap-2 text-[13px] lg:text-[14px] leading-relaxed"
              >
                <span className="font-medium shrink-0">{a.number}.</span>
                <span className="flex-1">{a.answer}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

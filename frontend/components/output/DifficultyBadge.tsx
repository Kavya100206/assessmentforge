import type { Difficulty } from '@/lib/types';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const styles: Record<Difficulty, string> = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Moderate: 'bg-amber-100 text-amber-700',
  Challenging: 'bg-rose-100 text-rose-700',
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${styles[difficulty]}`}
    >
      [{difficulty}]
    </span>
  );
}

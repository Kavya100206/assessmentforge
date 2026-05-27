interface StepIndicatorProps {
  current: 1 | 2;
  total?: number;
}

export function StepIndicator({ current, total = 2 }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const active = stepNum <= current;
        return (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              active ? 'bg-ink' : 'bg-line'
            }`}
          />
        );
      })}
    </div>
  );
}

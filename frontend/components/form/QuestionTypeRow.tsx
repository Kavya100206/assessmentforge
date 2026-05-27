'use client';

import { X } from 'lucide-react';
import { Select } from './Select';
import { Stepper } from './Stepper';

export const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Fill in the Blanks',
  'True or False',
] as const;

export interface QuestionTypeValue {
  type: string;
  count: number;
  marks: number;
}

interface QuestionTypeRowProps {
  value: QuestionTypeValue;
  onChange: (next: QuestionTypeValue) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function QuestionTypeRow({
  value,
  onChange,
  onRemove,
  canRemove,
}: QuestionTypeRowProps) {
  return (
    <div className="grid grid-cols-12 gap-3 items-center py-2">
      {/* Type + remove */}
      <div className="col-span-12 sm:col-span-6 flex items-center gap-2">
        <Select
          value={value.type}
          onChange={(type) => onChange({ ...value, type })}
          options={QUESTION_TYPE_OPTIONS}
          className="flex-1"
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="w-9 h-9 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-accent hover:bg-accent/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted transition-colors"
          aria-label="Remove row"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
      {/* Count */}
      <div className="col-span-6 sm:col-span-3 flex sm:justify-center">
        <Stepper
          value={value.count}
          onChange={(count) => onChange({ ...value, count })}
          min={0}
          max={99}
        />
      </div>
      {/* Marks */}
      <div className="col-span-6 sm:col-span-3 flex sm:justify-center">
        <Stepper
          value={value.marks}
          onChange={(marks) => onChange({ ...value, marks })}
          min={0}
          max={99}
        />
      </div>
    </div>
  );
}

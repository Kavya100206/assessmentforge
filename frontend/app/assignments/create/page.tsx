'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { StepIndicator } from '@/components/form/StepIndicator';
import { FileUploadDropzone } from '@/components/form/FileUploadDropzone';
import { DateField, ddmmyyyyToISO } from '@/components/form/DateField';
import {
  QuestionTypeRow,
  QUESTION_TYPE_OPTIONS,
  type QuestionTypeValue,
} from '@/components/form/QuestionTypeRow';
import { GeneratingOverlay } from '@/components/form/GeneratingOverlay';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { Assignment } from '@/lib/types';

const DEFAULT_ROWS: QuestionTypeValue[] = [
  { type: 'Multiple Choice Questions', count: 4, marks: 1 },
  { type: 'Short Questions', count: 3, marks: 2 },
  { type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
  { type: 'Numerical Problems', count: 5, marks: 5 },
];

interface GenState {
  inProgress: boolean;
  stage: string;
  progress: number;
  error: string | null;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const upsert = useAssignmentStore((s) => s.upsert);

  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [rows, setRows] = useState<QuestionTypeValue[]>(DEFAULT_ROWS);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [gen, setGen] = useState<GenState>({
    inProgress: false,
    stage: 'starting',
    progress: 0,
    error: null,
  });

  const totalQuestions = useMemo(
    () => rows.reduce((s, r) => s + (Number.isFinite(r.count) ? r.count : 0), 0),
    [rows]
  );
  const totalMarks = useMemo(
    () =>
      rows.reduce(
        (s, r) =>
          s + (Number.isFinite(r.count * r.marks) ? r.count * r.marks : 0),
        0
      ),
    [rows]
  );

  const updateRow = (i: number, next: QuestionTypeValue) =>
    setRows((curr) => curr.map((r, idx) => (idx === i ? next : r)));
  const removeRow = (i: number) =>
    setRows((curr) => curr.filter((_, idx) => idx !== i));
  const addRow = () => {
    const usedTypes = new Set(rows.map((r) => r.type));
    const nextType =
      QUESTION_TYPE_OPTIONS.find((t) => !usedTypes.has(t)) ??
      QUESTION_TYPE_OPTIONS[0];
    setRows((curr) => [...curr, { type: nextType, count: 1, marks: 1 }]);
  };

  const validateStep1 = (): string | null => {
    if (!dueDate.trim()) return 'Please pick a due date.';
    if (!ddmmyyyyToISO(dueDate)) return 'Due date must be a valid DD-MM-YYYY.';
    if (rows.length === 0) return 'Add at least one question type.';
    if (rows.some((r) => r.count < 1)) return 'Each question type needs at least 1 question.';
    if (rows.some((r) => r.marks < 1)) return 'Each question type needs at least 1 mark.';
    return null;
  };

  const onNext = () => {
    const err = validateStep1();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    // Derive a default title if user hasn't set one yet
    if (!title.trim()) {
      const inferred = file
        ? file.name.replace(/\.[^.]+$/, '')
        : `Assignment due ${dueDate}`;
      setTitle(inferred);
    }
    setStep(2);
  };

  const onSubmit = async () => {
    const iso = ddmmyyyyToISO(dueDate);
    if (!iso) {
      setValidationError('Due date is invalid.');
      setStep(1);
      return;
    }
    setGen({ inProgress: true, stage: 'starting', progress: 0, error: null });

    try {
      const fd = new FormData();
      fd.set('title', title.trim() || 'Untitled Assignment');
      fd.set('dueDate', iso);
      fd.set('questionTypes', JSON.stringify(rows));
      if (additionalInfo.trim()) fd.set('additionalInfo', additionalInfo.trim());
      if (file) fd.set('file', file);

      const { assignment } = await api.createAssignment(fd);
      upsert(assignment);
      subscribeAndWait(assignment, setGen, (completed) => {
        upsert(completed);
        router.push(`/output/${completed._id}`);
      });
    } catch (err) {
      setGen({
        inProgress: true,
        stage: 'starting',
        progress: 0,
        error: err instanceof Error ? err.message : 'Submission failed',
      });
    }
  };

  return (
    <AppShell breadcrumb="Assignment">
      <div className="px-6 pt-6">
        {/* page title */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h1 className="text-[22px] lg:text-[24px] font-semibold text-ink">
              Create Assignment
            </h1>
          </div>
          <p className="mt-1 text-[13px] text-ink-muted">
            Set up a new assignment for your students
          </p>
        </div>

        {/* card */}
        <div className="bg-surface-card border border-line rounded-3xl px-6 lg:px-8 pt-6 pb-8">
          <StepIndicator current={step} />

          <div className="mt-7">
            {step === 1 ? (
              <Step1
                file={file}
                onFileChange={setFile}
                dueDate={dueDate}
                onDueDateChange={setDueDate}
                rows={rows}
                onUpdateRow={updateRow}
                onRemoveRow={removeRow}
                onAddRow={addRow}
                additionalInfo={additionalInfo}
                onAdditionalInfoChange={setAdditionalInfo}
                totalQuestions={totalQuestions}
                totalMarks={totalMarks}
              />
            ) : (
              <Step2
                title={title}
                onTitleChange={setTitle}
                file={file}
                dueDate={dueDate}
                rows={rows}
                additionalInfo={additionalInfo}
                totalQuestions={totalQuestions}
                totalMarks={totalMarks}
              />
            )}
          </div>

          {validationError && (
            <p className="mt-4 text-[13px] text-accent">{validationError}</p>
          )}

          {/* nav buttons */}
          <div className="mt-8 pt-5 border-t border-line flex items-center justify-between">
            <button
              type="button"
              onClick={() => (step === 2 ? setStep(1) : router.back())}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-surface-card border border-line text-[14px] font-medium text-ink hover:bg-line-soft transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Previous
            </button>

            {step === 1 ? (
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-white text-[14px] font-medium hover:bg-ink/90 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={gen.inProgress}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-white text-[14px] font-medium hover:bg-ink/90 disabled:opacity-50 transition-colors"
              >
                Generate
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {gen.inProgress && (
        <GeneratingOverlay
          stage={gen.stage}
          progress={gen.progress}
          error={gen.error}
          onCancel={() =>
            setGen({ inProgress: false, stage: 'starting', progress: 0, error: null })
          }
        />
      )}
    </AppShell>
  );
}

// ----- Step 1 -----
interface Step1Props {
  file: File | null;
  onFileChange: (f: File | null) => void;
  dueDate: string;
  onDueDateChange: (d: string) => void;
  rows: QuestionTypeValue[];
  onUpdateRow: (i: number, next: QuestionTypeValue) => void;
  onRemoveRow: (i: number) => void;
  onAddRow: () => void;
  additionalInfo: string;
  onAdditionalInfoChange: (v: string) => void;
  totalQuestions: number;
  totalMarks: number;
}

function Step1(props: Step1Props) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-[16px] font-semibold text-ink">Assignment Details</h2>
        <p className="text-[13px] text-ink-muted mt-0.5">
          Basic information about your assignment
        </p>
      </div>

      <FileUploadDropzone file={props.file} onChange={props.onFileChange} />

      <div>
        <label className="block text-[13px] font-medium text-ink mb-2">
          Due Date
        </label>
        <DateField value={props.dueDate} onChange={props.onDueDateChange} />
      </div>

      <div>
        {/* table */}
        <div className="grid grid-cols-12 gap-3 px-1 pb-2 border-b border-line text-[12px] font-medium text-ink-muted uppercase tracking-wide">
          <div className="col-span-6">Question Type</div>
          <div className="col-span-3 sm:text-center">No. of Questions</div>
          <div className="col-span-3 sm:text-center">Marks</div>
        </div>
        <div className="divide-y divide-line">
          {props.rows.map((row, i) => (
            <QuestionTypeRow
              key={i}
              value={row}
              onChange={(next) => props.onUpdateRow(i, next)}
              onRemove={() => props.onRemoveRow(i)}
              canRemove={props.rows.length > 1}
            />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 gap-3">
          <button
            type="button"
            onClick={props.onAddRow}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink hover:text-accent transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add Question Type
          </button>
          <div className="text-[13px] text-ink-muted text-right space-y-0.5">
            <p>
              Total Questions : <span className="text-ink font-semibold">{props.totalQuestions}</span>
            </p>
            <p>
              Total Marks : <span className="text-ink font-semibold">{props.totalMarks}</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-ink mb-2">
          Additional Information{' '}
          <span className="text-ink-muted font-normal">(For better output)</span>
        </label>
        <textarea
          value={props.additionalInfo}
          onChange={(e) => props.onAdditionalInfoChange(e.target.value)}
          rows={4}
          placeholder="e.g. Generate a question paper for 3 hour exam duration..."
          className="w-full px-4 py-3 rounded-xl bg-surface-card border border-line text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/30 transition-colors resize-none"
        />
      </div>
    </div>
  );
}

// ----- Step 2: Review -----
interface Step2Props {
  title: string;
  onTitleChange: (t: string) => void;
  file: File | null;
  dueDate: string;
  rows: QuestionTypeValue[];
  additionalInfo: string;
  totalQuestions: number;
  totalMarks: number;
}

function Step2(props: Step2Props) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-[16px] font-semibold text-ink">Review &amp; Generate</h2>
        <p className="text-[13px] text-ink-muted mt-0.5">
          Confirm everything looks right, then hit Generate.
        </p>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-ink mb-2">
          Title
        </label>
        <input
          type="text"
          value={props.title}
          onChange={(e) => props.onTitleChange(e.target.value)}
          placeholder="e.g. Photosynthesis — Class 10 Biology"
          className="w-full h-11 px-4 rounded-xl bg-surface-card border border-line text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/30 transition-colors"
        />
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[13px]">
        <Row label="Due date" value={props.dueDate || '—'} />
        <Row label="Source file" value={props.file?.name ?? 'None'} />
        <Row label="Total questions" value={String(props.totalQuestions)} />
        <Row label="Total marks" value={String(props.totalMarks)} />
      </dl>

      <div>
        <p className="text-[13px] font-medium text-ink mb-2">Question types</p>
        <ul className="text-[13px] text-ink space-y-1.5">
          {props.rows.map((r, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-line-soft px-4 py-2.5">
              <span>{r.type}</span>
              <span className="text-ink-muted">
                {r.count} × {r.marks} = <span className="text-ink font-semibold">{r.count * r.marks}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {props.additionalInfo.trim() && (
        <div>
          <p className="text-[13px] font-medium text-ink mb-2">Additional info</p>
          <p className="text-[13px] text-ink-muted whitespace-pre-line">
            {props.additionalInfo}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-ink font-medium mt-0.5 break-words">{value}</dd>
    </div>
  );
}

// ----- socket wait -----
function subscribeAndWait(
  assignment: Assignment,
  setGen: (s: GenState) => void,
  onComplete: (a: Assignment) => void
) {
  const socket = getSocket();
  const id = assignment._id;

  const join = () => socket.emit('join', id);
  if (socket.connected) join();
  else socket.once('connect', join);

  const onProgress = (p: { assignmentId: string; stage: string; progress: number }) => {
    if (p.assignmentId !== id) return;
    setGen({
      inProgress: true,
      stage: p.stage,
      progress: p.progress,
      error: null,
    });
  };

  const onCompleteEvt = (_p: { assignmentId: string; output: unknown }) => {
    cleanup();
    // re-fetch to get the canonical stored doc
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/assignments/${id}`
    )
      .then((r) => r.json())
      .then((j: { assignment: Assignment }) => onComplete(j.assignment))
      .catch(() => onComplete(assignment));
  };

  const onErr = (p: { assignmentId: string; error: string }) => {
    if (p.assignmentId !== id) return;
    cleanup();
    setGen({
      inProgress: true,
      stage: 'starting',
      progress: 0,
      error: p.error,
    });
  };

  socket.on('generation:progress', onProgress);
  socket.on('generation:complete', onCompleteEvt);
  socket.on('generation:error', onErr);

  function cleanup() {
    socket.off('generation:progress', onProgress);
    socket.off('generation:complete', onCompleteEvt);
    socket.off('generation:error', onErr);
  }
}

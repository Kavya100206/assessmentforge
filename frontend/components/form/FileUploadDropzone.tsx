'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';

interface FileUploadDropzoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeBytes?: number;
}

export function FileUploadDropzone({
  file,
  onChange,
  accept = '.pdf,.png,.jpg,.jpeg,.txt,.md',
  maxSizeBytes = 10 * 1024 * 1024,
}: FileUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > maxSizeBytes) {
      setError(`File too large. Max ${Math.round(maxSizeBytes / 1024 / 1024)} MB.`);
      return;
    }
    onChange(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {file ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-line bg-surface-card">
          <div className="w-10 h-10 rounded-lg bg-line-soft flex items-center justify-center text-ink-muted">
            <FileText className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-ink truncate">{file.name}</p>
            <p className="text-[12px] text-ink-muted">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-line-soft transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 px-6 py-10 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
            dragging
              ? 'border-ink/40 bg-line-soft'
              : 'border-line hover:border-ink/20 hover:bg-line-soft/40'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-line-soft flex items-center justify-center text-ink-muted mb-1">
            <UploadCloud className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <p className="text-[14px] font-medium text-ink">
            Choose a file or drag &amp; drop it here
          </p>
          <p className="text-[12px] text-ink-muted">JPEG, PNG, upto 10MB</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="mt-3 inline-flex items-center h-9 px-4 rounded-xl bg-surface-card border border-line text-[13px] font-medium text-ink hover:bg-line-soft transition-colors"
          >
            Browse Files
          </button>
        </div>
      )}

      <p className="mt-2 text-center text-[12px] text-ink-muted">
        Upload images of your preferred document/image
      </p>

      {error && (
        <p className="mt-2 text-center text-[12px] text-accent">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
      />
    </div>
  );
}

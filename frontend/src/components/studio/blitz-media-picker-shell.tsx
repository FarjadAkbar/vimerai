"use client";

import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MediaUploadZone({
  accept,
  title,
  hint,
  uploading,
  onFiles,
}: {
  accept: string;
  title: string;
  hint: string;
  uploading?: boolean;
  onFiles: (files: FileList | File[]) => void | Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    void onFiles(files);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center transition",
        dragging ? "border-neutral-900 bg-neutral-100" : "",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <Upload className="mx-auto h-7 w-7 text-neutral-500" />
      <p className="mt-3 text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mt-1 text-xs text-[var(--studio-muted)]">{hint}</p>
      <Button
        type="button"
        className="mt-4 rounded-full bg-zinc-950 px-5 text-white hover:bg-zinc-800"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Browse files
      </Button>
    </div>
  );
}

export function MediaPickerShell({
  title,
  onClose,
  children,
  footerLeft,
  footerRight,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--studio-border)] px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            className="rounded-full p-1 text-[var(--studio-muted)] hover:bg-neutral-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex items-center justify-between gap-3 border-t border-[var(--studio-border)] px-6 py-4">
          <div className="text-sm text-[var(--studio-muted)]">{footerLeft}</div>
          <div className="flex items-center gap-2">{footerRight}</div>
        </div>
      </div>
    </div>
  );
}

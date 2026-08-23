"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLITZ_FORMATS, type BlitzFormatId } from "@/components/studio/blitz-data";

export function BlitzTemplatesModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (formatId: BlitzFormatId) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 text-[var(--studio-muted)] hover:bg-neutral-100"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold tracking-tight">Generate Content</h2>
        <p className="mt-1 text-sm text-[var(--studio-muted)]">
          Pick a format to start
        </p>

        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {BLITZ_FORMATS.map((format) => (
            <button
              key={format.id}
              type="button"
              onClick={() => {
                onPick(format.id);
                onClose();
              }}
              className="w-48 shrink-0 overflow-hidden rounded-2xl border border-[var(--studio-border)] text-left transition hover:border-black/30"
            >
              <div
                className={`relative aspect-[9/14] bg-gradient-to-b ${format.gradient} p-3`}
              >
                <p className="text-xs font-semibold leading-snug text-white drop-shadow">
                  {format.sampleHook}
                </p>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold">{format.label}</p>
                <p className="mt-1 text-xs text-[var(--studio-muted)]">
                  {format.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Button variant="outline" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

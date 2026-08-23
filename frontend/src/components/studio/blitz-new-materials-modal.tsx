"use client";

import { ImageIcon, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BlitzMaterial } from "@/components/studio/blitz-data";

export function NewMaterialsModal({
  open,
  onClose,
  materials,
  generating,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  materials: BlitzMaterial[];
  generating: boolean;
  onGenerate: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,720px)] w-[calc(100%-2rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
          <DialogHeader className="shrink-0 space-y-2 text-left">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5" />
              New Materials
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Generate fresh Slideshow images and follow every batch without
              pausing Blitz.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 shrink-0 rounded-2xl bg-neutral-50 p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <ImageIcon className="h-5 w-5 text-[var(--studio-muted)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Slideshow image pool</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--studio-muted)]">
                  Generate a fresh image batch whenever you want. Each completed
                  image is activated and prioritized in Blitz immediately.
                </p>
              </div>
            </div>
            <Button
              className="mt-4 w-full rounded-full bg-neutral-900 text-white hover:bg-black"
              disabled={generating}
              onClick={onGenerate}
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate new images
            </Button>
          </div>

          <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Generation history</p>
                <p className="mt-1 text-xs text-[var(--studio-muted)]">
                  Each image becomes usable as soon as it succeeds.
                </p>
              </div>
              <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-[var(--studio-muted)]" />
            </div>

            {materials.length === 0 ? (
              <div className="mt-4 flex min-h-[9rem] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--studio-border)] px-4 py-8 text-center">
                <RefreshCw className="h-6 w-6 text-[var(--studio-muted)]" />
                <p className="mt-2 text-sm text-[var(--studio-muted)]">
                  No generated material batches yet.
                </p>
              </div>
            ) : (
              <ul className="mt-4 grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-y-auto pr-1">
                {materials.map((material) => (
                  <li
                    key={material.id}
                    className="overflow-hidden rounded-xl border border-[var(--studio-border)]"
                  >
                    {material.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={material.imageUrl}
                        alt=""
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-neutral-100 text-[10px] text-[var(--studio-muted)]">
                        {material.status}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BLITZ_FORMATS,
  MENTION_OPTIONS,
  type BlitzConfig,
  type BlitzFormatId,
  type MentionFrequency,
} from "@/components/studio/blitz-data";
import { cn } from "@/lib/utils";

export function BlitzConfigureModal({
  open,
  onClose,
  config,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  config: BlitzConfig;
  onSave: (config: BlitzConfig) => void;
}) {
  const [draft, setDraft] = useState(config);

  useEffect(() => {
    if (open) setDraft(config);
  }, [open, config]);

  if (!open) return null;

  const setMention = (value: MentionFrequency) => {
    setDraft((prev) => ({ ...prev, mentionFrequency: value }));
  };

  const toggleFormat = (id: BlitzFormatId) => {
    setDraft((prev) => ({
      ...prev,
      enabledFormats: {
        ...prev.enabledFormats,
        [id]: !prev.enabledFormats[id],
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 text-[var(--studio-muted)] hover:bg-neutral-100"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold tracking-tight">Blitz Configure</h2>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
          Blitz settings
        </p>

        <section className="mt-8">
          <p className="text-sm font-semibold">Mention business</p>
          <p className="mt-1 text-xs text-[var(--studio-muted)]">
            How often generated ideas should mention your product or brand.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MENTION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMention(option.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  draft.mentionFrequency === option.value
                    ? "border-[var(--studio-ink)] font-medium"
                    : "border-[var(--studio-border)] text-[var(--studio-muted)] hover:border-black/20",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 flex items-start justify-between gap-4 border-t border-[var(--studio-border)] pt-6">
          <div className="flex gap-3">
            <User className="mt-0.5 h-4 w-4 text-[var(--studio-muted)]" />
            <div>
              <p className="text-sm font-semibold">Show Influencer materials</p>
              <p className="mt-1 text-xs text-[var(--studio-muted)]">
                When available, newly generated recommendations may occasionally
                use an Influencer asset.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.showInfluencerMaterials}
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                showInfluencerMaterials: !prev.showInfluencerMaterials,
              }))
            }
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition",
              draft.showInfluencerMaterials
                ? "bg-neutral-900"
                : "bg-neutral-300",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                draft.showInfluencerMaterials ? "left-5" : "left-0.5",
              )}
            />
          </button>
        </section>

        <section className="mt-8 border-t border-[var(--studio-border)] pt-6">
          <p className="text-sm font-semibold">Content type</p>
          <p className="mt-1 text-xs text-[var(--studio-muted)]">
            Choose which creative types can appear in the recommendation queue.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {BLITZ_FORMATS.map((format) => (
              <div
                key={format.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--studio-border)] p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{format.label}</p>
                  <p className="mt-1 text-xs text-[var(--studio-muted)]">
                    {format.description}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draft.enabledFormats[format.id]}
                  onClick={() => toggleFormat(format.id)}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition",
                    draft.enabledFormats[format.id]
                      ? "bg-neutral-900"
                      : "bg-neutral-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                      draft.enabledFormats[format.id] ? "left-5" : "left-0.5",
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-full bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

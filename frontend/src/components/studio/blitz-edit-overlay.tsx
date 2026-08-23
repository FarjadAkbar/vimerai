"use client";

import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BlitzCard } from "@/components/studio/blitz-data";
import { cn } from "@/lib/utils";

function MediaSurface({
  src,
  className,
  children,
}: {
  src: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const isGradient = src.startsWith("gradient:");
  const gradient = isGradient ? src.replace("gradient:", "") : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-neutral-900",
        className,
        gradient ? `bg-gradient-to-b ${gradient}` : "",
      )}
    >
      {!isGradient ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      {children}
    </div>
  );
}

export function BlitzEditOverlay({
  card,
  brandName,
  prompt,
  onPromptChange,
  mentionBusiness,
  onMentionChange,
  onRegenerateText,
  onDone,
  onClose,
}: {
  card: BlitzCard;
  brandName: string;
  prompt: string;
  onPromptChange: (value: string) => void;
  mentionBusiness: boolean;
  onMentionChange: (value: boolean) => void;
  onRegenerateText: () => void;
  onDone: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-r border-[var(--studio-border)] p-5 lg:flex">
        <button
          type="button"
          className="mb-4 self-start rounded-full p-1 hover:bg-neutral-100"
          onClick={onClose}
          aria-label="Close editor"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
          Assets
        </p>
        <div className="mt-3 space-y-3">
          <AssetRow label="Meme Video" detail="Overlay clip" />
          <AssetRow
            label="Background"
            detail={card.remix.backgroundLabel}
            thumb={card.remix.imageUrl}
          />
        </div>

        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
          Mention your business?
        </p>
        <div className="mt-3 flex gap-2">
          {(["Yes", "No"] as const).map((label) => {
            const yes = label === "Yes";
            const active = yes === mentionBusiness;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onMentionChange(yes)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm",
                  active
                    ? "border-[var(--studio-ink)] font-medium"
                    : "border-[var(--studio-border)] text-[var(--studio-muted)]",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
          Prompt
        </p>
        <textarea
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="Optional instructions for regeneration..."
          rows={4}
          className="mt-3 w-full resize-none rounded-2xl border border-[var(--studio-border)] p-3 text-sm outline-none focus:border-[var(--studio-ink)]"
        />
        <Button
          variant="outline"
          className="mt-3 rounded-full"
          onClick={onRegenerateText}
        >
          Regenerate Text
        </Button>
        <p className="mt-auto pt-6 text-xs text-[var(--studio-muted)]">
          Editing for {brandName}
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-6">
        <MediaSurface
          src={card.remix.imageUrl}
          className="aspect-[9/16] w-full max-w-sm rounded-[1.75rem] shadow-2xl"
        >
          <div className="absolute inset-x-4 top-10 z-[1]">
            <p className="text-center text-lg font-bold leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {card.remix.hook}
            </p>
          </div>
          {card.formatId === "green-screen" ? (
            <div className="absolute inset-x-0 bottom-8 z-[1] flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-200 to-orange-500 shadow-lg ring-2 ring-white/50" />
            </div>
          ) : null}
        </MediaSurface>

        <Button
          className="rounded-full bg-neutral-900 px-8 text-white hover:bg-black"
          onClick={onDone}
        >
          ✓ Done Editing
        </Button>
      </div>

      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-l border-[var(--studio-border)] p-5 lg:flex">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
          Playback
        </p>
        <div className="mt-3 space-y-2">
          <SideAction icon={Play} label="Play from Start" />
          <SideAction icon={Pause} label="Pause" />
          <SideAction icon={VolumeX} label="Unmute Audio" />
        </div>
        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
          Adjust
        </p>
        <div className="mt-3 space-y-2">
          <SideAction icon={Volume2} label="Audio Volume" />
          <button
            type="button"
            className="w-full rounded-xl border border-[var(--studio-border)] px-3 py-2 text-left text-sm hover:bg-neutral-50"
          >
            Swap Image
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-[var(--studio-border)] px-3 py-2 text-left text-sm hover:bg-neutral-50"
          >
            Text
          </button>
        </div>
        <div className="mt-auto space-y-2">
          <Button variant="outline" className="w-full rounded-full">
            Add Text
          </Button>
          <Button variant="outline" className="w-full rounded-full">
            Add Overlay
          </Button>
        </div>
      </aside>
    </div>
  );
}

function AssetRow({
  label,
  detail,
  thumb,
}: {
  label: string;
  detail: string;
  thumb?: string;
}) {
  const isGradient = thumb?.startsWith("gradient:");
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--studio-border)] p-2">
      <div className="h-12 w-10 overflow-hidden rounded-lg bg-neutral-100">
        {thumb && !isGradient ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className={`h-full w-full bg-gradient-to-b ${
              isGradient
                ? thumb!.replace("gradient:", "")
                : "from-neutral-400 to-neutral-700"
            }`}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-[var(--studio-muted)]">{detail}</p>
      </div>
      <button
        type="button"
        className="rounded-full border border-[var(--studio-border)] px-2.5 py-1 text-xs"
      >
        Swap
      </button>
    </div>
  );
}

function SideAction({
  icon: Icon,
  label,
}: {
  icon: typeof Play;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-xl border border-[var(--studio-border)] px-3 py-2 text-left text-sm hover:bg-neutral-50"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Globe, Music2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MediaPickerShell,
  MediaUploadZone,
} from "@/components/studio/blitz-media-picker-shell";
import { PLATFORM_AUDIOS } from "@/components/studio/platform-audios";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  mapMediaAssetToLibraryItem,
  useMediaAssets,
  useUploadMediaAsset,
} from "@/lib/hooks/use-media-assets";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

export function BlitzSelectAudioModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (selection: {
    url: string | null;
    name: string;
    file?: File;
  }) => void;
}) {
  const { data, isLoading } = useMediaAssets("audio", open);
  const uploadMedia = useUploadMediaAsset();
  const [tab, setTab] = useState<"platform" | "mine">("platform");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const items = (data?.assets ?? []).map(mapMediaAssetToLibraryItem);
  const totalPages = Math.max(1, Math.ceil(PLATFORM_AUDIOS.length / PAGE_SIZE));
  const platformPage = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return PLATFORM_AUDIOS.slice(start, start + PAGE_SIZE);
  }, [page]);

  if (!open) return null;

  const uploadAudio = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    setError(null);
    try {
      const result = await uploadMedia.mutateAsync(file);
      onSelect({ url: result.asset.url, name: result.asset.name });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload audio"));
    }
  };

  return (
    <MediaPickerShell
      title="Select Audio"
      onClose={onClose}
      footerLeft={
        tab === "platform" ? (
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              className="disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              ← Previous
            </button>
            <span>
              Page{" "}
              <span className="inline-flex min-w-8 justify-center rounded border border-[var(--studio-border)] px-2 py-0.5 font-medium text-zinc-950">
                {page}
              </span>{" "}
              of {totalPages}
            </span>
            <button
              type="button"
              className="disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
            >
              Next →
            </button>
          </div>
        ) : (
          <span>{items.length} audio options</span>
        )
      }
      footerRight={
        <Button variant="outline" className="rounded-full" onClick={onClose}>
          Cancel
        </Button>
      }
    >
      <div className="mb-5 flex gap-6 border-b border-[var(--studio-border)]">
        <TabButton
          active={tab === "platform"}
          icon={Globe}
          label="Platform"
          onClick={() => setTab("platform")}
        />
        <TabButton
          active={tab === "mine"}
          icon={Music2}
          label={`My Audios (${items.length})`}
          onClick={() => setTab("mine")}
        />
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      {tab === "platform" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platformPage.map((audio) => (
            <button
              key={audio.id}
              type="button"
              onClick={() => {
                onSelect({ url: audio.url, name: audio.name });
                onClose();
              }}
              className="flex items-center gap-3 rounded-2xl border border-[var(--studio-border)] p-3 text-left transition hover:border-black/30"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                {audio.url ? (
                  <Music2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{audio.name}</p>
                <p className="truncate text-xs text-[var(--studio-muted)]">
                  {audio.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <MediaUploadZone
            accept="audio/*"
            title="Upload audio"
            hint="Drag and drop an audio file here, or browse from your device."
            uploading={uploadMedia.isPending}
            onFiles={uploadAudio}
          />
          {isLoading ? (
            <p className="py-10 text-center text-sm text-[var(--studio-muted)]">
              Loading your audio library…
            </p>
          ) : items.length === 0 ? (
            <div className="py-10 text-center">
              <Music2 className="mx-auto h-8 w-8 text-neutral-400" />
              <p className="mt-3 text-sm font-semibold">No audio uploaded yet</p>
              <p className="mt-1 text-xs text-[var(--studio-muted)]">
                Upload audio here, or choose an audio file already saved in
                Library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect({ url: item.url, name: item.name });
                    onClose();
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--studio-border)] p-3 text-left transition hover:border-black/30"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                    <Music2 className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="truncate text-xs text-[var(--studio-muted)]">
                      Uploaded
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </MediaPickerShell>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Globe;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition",
        active
          ? "border-zinc-950 text-zinc-950"
          : "border-transparent text-[var(--studio-muted)] hover:text-zinc-800",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

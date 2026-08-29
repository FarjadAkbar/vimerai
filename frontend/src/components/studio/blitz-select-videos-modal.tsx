"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MediaPickerShell,
  MediaUploadZone,
} from "@/components/studio/blitz-media-picker-shell";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  mapMediaAssetToLibraryItem,
  useMediaAssets,
  useUploadMediaAsset,
} from "@/lib/hooks/use-media-assets";
import { cn } from "@/lib/utils";

export function BlitzSelectVideosModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (selection: { url: string; name: string }) => void;
}) {
  const { data, isLoading } = useMediaAssets("video", open);
  const uploadMedia = useUploadMediaAsset();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items = (data?.assets ?? []).map(mapMediaAssetToLibraryItem);

  if (!open) return null;

  const selected = items.find((item) => item.id === selectedId) ?? null;

  const uploadVideo = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    setError(null);
    try {
      const result = await uploadMedia.mutateAsync(file);
      setSelectedId(result.asset.id);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload video"));
    }
  };

  return (
    <MediaPickerShell
      title="My Videos"
      onClose={onClose}
      footerLeft={<span>{items.length} videos in library</span>}
      footerRight={
        <>
          <Button variant="outline" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-neutral-300"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              onSelect({ url: selected.url, name: selected.name });
              onClose();
            }}
          >
            Use Video
          </Button>
        </>
      }
    >
      <MediaUploadZone
        accept="video/*"
        title="Upload a video"
        hint="Drag and drop a video here, or browse from your device."
        uploading={uploadMedia.isPending}
        onFiles={uploadVideo}
      />

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-[var(--studio-muted)]">
          Loading your video library…
        </p>
      ) : items.length === 0 ? (
        <div className="py-12 text-center">
          <Video className="mx-auto h-8 w-8 text-neutral-400" />
          <p className="mt-3 text-sm font-semibold">No videos uploaded yet</p>
          <p className="mt-1 text-xs text-[var(--studio-muted)]">
            Upload a video here to reuse across Blitz edits and Viral Remix.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={cn(
                "overflow-hidden rounded-2xl border text-left transition",
                selectedId === item.id
                  ? "border-zinc-950 ring-2 ring-zinc-950/10"
                  : "border-[var(--studio-border)] hover:border-black/30",
              )}
            >
              <video
                src={item.url}
                className="aspect-[9/14] w-full bg-neutral-900 object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <p className="truncate px-2 py-2 text-xs font-medium">
                {item.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </MediaPickerShell>
  );
}

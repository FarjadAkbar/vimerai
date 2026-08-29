"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  CircleHelp,
  FolderOpen,
  ImageIcon,
  Loader2,
  Music,
  Upload,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContentLibraryItem } from "@/lib/api/content-library.api";
import type { ContentStatusBucket } from "@/lib/api/content-library.api";
import type { MediaAsset, MediaAssetKind } from "@/lib/api/media-assets.api";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  formatJobTypeLabel,
  useContentLibrary,
  useMediaStore,
} from "@/lib/hooks/use-library";
import { useUploadMediaAsset } from "@/lib/hooks/use-media-assets";
import { PRODUCT_PATH } from "@/lib/product-path";
import { cn } from "@/lib/utils";

type LibraryTab = "content" | "media";
type ContentFilter = "all" | ContentStatusBucket;
type MediaFilter = "all" | MediaAssetKind;

const CONTENT_FILTERS: Array<{ id: ContentFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "building", label: "Building" },
  { id: "created", label: "Created" },
  { id: "failed", label: "Failed" },
];

const MEDIA_FILTERS: Array<{ id: MediaFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "audio", label: "Audios" },
];

export default function StudioLibraryPage() {
  const [tab, setTab] = useState<LibraryTab>("content");
  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const contentQuery = useContentLibrary(
    contentFilter === "all" ? undefined : contentFilter,
  );
  const mediaQuery = useMediaStore(
    mediaFilter === "all" ? undefined : mediaFilter,
  );
  const uploadMedia = useUploadMediaAsset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentItems = contentQuery.data?.items ?? [];
  const mediaAssets = mediaQuery.data?.assets ?? [];

  const onUpload = async (file: File) => {
    setUploadError(null);
    try {
      await uploadMedia.mutateAsync(file);
    } catch (err) {
      setUploadError(getApiErrorMessage(err, "Could not upload file"));
    }
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
        <CircleHelp className="h-4 w-4 text-[var(--studio-muted)]" />
      </div>

      <div className="mt-6 flex min-h-[calc(100dvh-10rem)] flex-1 flex-col rounded-[1.75rem] border border-[var(--studio-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-[var(--studio-border)] pb-4">
          <TabButton
            active={tab === "content"}
            onClick={() => setTab("content")}
            label="My Content"
          />
          <TabButton
            active={tab === "media"}
            onClick={() => setTab("media")}
            label="My Media Store"
          />
        </div>

        {tab === "content" ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {CONTENT_FILTERS.map((filter) => (
                <FilterPill
                  key={filter.id}
                  active={contentFilter === filter.id}
                  onClick={() => setContentFilter(filter.id)}
                  label={filter.label}
                />
              ))}
            </div>

            {contentQuery.isLoading ? (
              <div className="flex flex-1 items-center justify-center py-16 text-sm text-[var(--studio-muted)]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading content…
              </div>
            ) : contentItems.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No content yet"
                body="Outputs from Viral Remix and Blitz edits appear here once a job completes."
                action={
                  <>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={PRODUCT_PATH.videos}>Viral Remix</Link>
                    </Button>
                    <Button asChild className="rounded-full bg-neutral-900 text-white hover:bg-black">
                      <Link href={PRODUCT_PATH.blitz}>Blitz</Link>
                    </Button>
                  </>
                }
              />
            ) : (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {contentItems.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {MEDIA_FILTERS.map((filter) => (
                  <FilterPill
                    key={filter.id}
                    active={mediaFilter === filter.id}
                    onClick={() => setMediaFilter(filter.id)}
                    label={filter.label}
                  />
                ))}
              </div>
              <Button
                className="rounded-full bg-neutral-900 text-white hover:bg-black"
                disabled={uploadMedia.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadMedia.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload
              </Button>
            </div>

            {uploadError ? (
              <p className="mt-3 text-sm text-red-600">{uploadError}</p>
            ) : null}

            {mediaQuery.isLoading ? (
              <div className="flex flex-1 items-center justify-center py-16 text-sm text-[var(--studio-muted)]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading media…
              </div>
            ) : mediaAssets.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="No media yet"
                body="Upload images, videos, or audio to reuse across Blitz, Viral Remix, and pickers."
                action={
                  <Button
                    className="rounded-full bg-neutral-900 text-white hover:bg-black"
                    disabled={uploadMedia.isPending}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload file
                  </Button>
                }
              />
            ) : (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mediaAssets.map((asset) => (
                  <MediaCard key={asset.id} asset={asset} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void onUpload(file);
        }}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-neutral-900 text-white"
          : "text-[var(--studio-muted)] hover:bg-neutral-100 hover:text-[var(--studio-ink)]",
      )}
    >
      {label}
    </button>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-[var(--studio-border)] text-[var(--studio-muted)] hover:border-black/20",
      )}
    >
      {label}
    </button>
  );
}

function ContentCard({ item }: { item: ContentLibraryItem }) {
  const statusLabel =
    item.jobStatus === "completed"
      ? "Created"
      : item.jobStatus === "failed"
        ? "Failed"
        : "Building";

  return (
    <li className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-canvas)]">
      <div className="aspect-[9/16] bg-neutral-100">
        {item.mediaUrl && item.jobStatus === "completed" ? (
          item.mediaKind === "video" ? (
            <video
              src={item.mediaUrl}
              className="h-full w-full object-cover"
              controls
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.mediaUrl}
              alt={item.title ?? "Content"}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center text-xs text-[var(--studio-muted)]">
            {item.jobStatus === "failed" ? (
              <span className="text-red-600">
                {item.jobError ?? "Job failed"}
              </span>
            ) : (
              <>
                <Loader2 className="mb-2 h-5 w-5 animate-spin" />
                Building…
              </>
            )}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold">
          {item.title ?? formatJobTypeLabel(item.jobType)}
        </p>
        <p className="mt-1 text-xs text-[var(--studio-muted)]">
          {formatJobTypeLabel(item.jobType)} · {statusLabel}
        </p>
      </div>
    </li>
  );
}

function MediaCard({ asset }: { asset: MediaAsset }) {
  const Icon =
    asset.kind === "video" ? Video : asset.kind === "audio" ? Music : ImageIcon;

  return (
    <li className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-white">
      <div className="relative aspect-square bg-neutral-100">
        {asset.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.url}
            alt={asset.name}
            className="h-full w-full object-cover"
          />
        ) : asset.kind === "video" ? (
          <video
            src={asset.url}
            className="h-full w-full object-cover"
            muted
            playsInline
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--studio-muted)]">
            <Icon className="h-8 w-8" />
            <span className="text-xs capitalize">{asset.kind}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium">{asset.name}</p>
        <p className="mt-1 text-xs capitalize text-[var(--studio-muted)]">
          {asset.kind}
        </p>
      </div>
    </li>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof FolderOpen;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
        <Icon className="h-6 w-6 text-[var(--studio-muted)]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[var(--studio-muted)]">{body}</p>
      {action ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>
      ) : null}
    </div>
  );
}

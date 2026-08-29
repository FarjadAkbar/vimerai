"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { BlitzSelectImagesModal } from "@/components/studio/blitz-select-images-modal";
import { GENDER_OPTIONS } from "@/components/studio/influencer-data";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { InfluencerContentItem } from "@/lib/api/influencer-images.api";
import type { InfluencerVideoMode } from "@/lib/api/influencer-images.api";
import {
  useAnimateInfluencerImage,
  useGenerateInfluencerImage,
  useGenerateInfluencerVideo,
  useInfluencerImages,
  useInfluencerVideos,
} from "@/lib/hooks/use-influencer-images";
import { useInfluencer } from "@/lib/hooks/use-influencers";
import { PRODUCT_PATH } from "@/lib/product-path";
import { cn } from "@/lib/utils";

type DetailTab = "images" | "videos";

type ReferenceChip = {
  id: string;
  url: string;
  name: string;
};

export default function InfluencerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading, error } = useInfluencer(id);
  const [tab, setTab] = useState<DetailTab>("images");

  const influencer = data?.influencer;

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center text-sm text-[var(--studio-muted)]">
        Loading influencer…
      </div>
    );
  }

  if (error || !influencer) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-[var(--studio-muted)]">
          Influencer not found or could not be loaded.
        </p>
        <Link
          href={PRODUCT_PATH.influencers}
          className="text-sm font-medium underline"
        >
          Back to influencers
        </Link>
      </div>
    );
  }

  const genderLabel =
    GENDER_OPTIONS.find((option) => option.value === influencer.gender)?.label ??
    influencer.gender;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col">
      <Link
        href={PRODUCT_PATH.influencers}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--studio-muted)] hover:text-[var(--studio-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        All influencers
      </Link>

      <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-[var(--studio-border)] bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          <div className="mx-auto h-48 w-36 shrink-0 overflow-hidden rounded-[1.25rem] border border-[var(--studio-border)] bg-neutral-100 sm:mx-0">
            {influencer.portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={influencer.portraitUrl}
                alt={influencer.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {influencer.name}
            </h1>
            <p className="mt-2 text-sm text-[var(--studio-muted)]">
              {genderLabel} · {influencer.age}
              {influencer.ethnicity ? ` · ${influencer.ethnicity}` : ""}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--studio-muted)]">
              {influencer.appearancePrompt}
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--studio-border)] px-6">
          <div className="flex gap-1 pt-3">
            <TabButton
              active={tab === "images"}
              onClick={() => setTab("images")}
              icon={ImageIcon}
              label="Images"
            />
            <TabButton
              active={tab === "videos"}
              onClick={() => setTab("videos")}
              icon={Video}
              label="Videos"
            />
          </div>
        </div>

        <div className="border-t border-[var(--studio-border)] p-6">
          {tab === "images" ? (
            <ImagesTab influencerId={id} portraitUrl={influencer.portraitUrl} />
          ) : (
            <VideosTab
              influencerId={id}
              portraitUrl={influencer.portraitUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ImagesTab({
  influencerId,
  portraitUrl,
}: {
  influencerId: string;
  portraitUrl: string | null;
}) {
  const { data, isLoading } = useInfluencerImages(influencerId);
  const generate = useGenerateInfluencerImage(influencerId);
  const animate = useAnimateInfluencerImage(influencerId);
  const [instructions, setInstructions] = useState("");
  const [references, setReferences] = useState<ReferenceChip[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const items = data?.items ?? [];

  const addReference = (selection: { id: string; url: string; name: string }) => {
    setReferences((current) => {
      if (current.some((ref) => ref.id === selection.id)) {
        return current;
      }
      return [...current, selection];
    });
  };

  const removeReference = (refId: string) => {
    setReferences((current) => current.filter((ref) => ref.id !== refId));
  };

  const handleGenerate = async () => {
    setFormError(null);
    try {
      await generate.mutateAsync({
        instructions: instructions.trim() || undefined,
        referenceMediaAssetIds: references.map((ref) => ref.id),
      });
      setInstructions("");
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not generate image"));
    }
  };

  const handleAnimate = async (contentItemId: string) => {
    try {
      await animate.mutateAsync(contentItemId);
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not animate image"));
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-canvas)] p-5">
        <h2 className="text-sm font-semibold">Generate image</h2>
        <p className="mt-1 text-sm text-[var(--studio-muted)]">
          Add reference images and instructions. The influencer portrait is used
          automatically when available.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {portraitUrl ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[var(--studio-border)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portraitUrl}
                alt="Portrait reference"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-center text-[10px] text-white">
                Portrait
              </span>
            </div>
          ) : null}
          {references.map((ref) => (
            <div
              key={ref.id}
              className="relative h-16 w-16 overflow-hidden rounded-xl border border-[var(--studio-border)] bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ref.url}
                alt={ref.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeReference(ref.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                aria-label={`Remove ${ref.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--studio-border)] bg-white text-[var(--studio-muted)] hover:border-neutral-400 hover:text-[var(--studio-ink)]"
          >
            <Plus className="h-4 w-4" />
            <span className="mt-1 text-[10px]">Add ref</span>
          </button>
        </div>

        <textarea
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder="Instructions (optional) — e.g. outdoor golden hour, casual streetwear"
          rows={3}
          className="mt-4 w-full rounded-xl border border-[var(--studio-border)] bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400"
        />

        {formError ? (
          <p className="mt-3 text-sm text-red-600">{formError}</p>
        ) : null}

        <Button
          className="mt-4 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-neutral-300"
          disabled={generate.isPending || (!portraitUrl && references.length === 0)}
          onClick={handleGenerate}
        >
          {generate.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </section>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-[var(--studio-muted)]">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading images…
        </div>
      ) : items.length === 0 ? (
        <TabShell
          icon={ImageIcon}
          title="No images yet"
          body="Generated influencer images will appear here."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <InfluencerImageCard
              key={item.id}
              item={item}
              animating={animate.isPending}
              onAnimate={() => handleAnimate(item.id)}
            />
          ))}
        </ul>
      )}

      <BlitzSelectImagesModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addReference}
      />
    </div>
  );
}

function InfluencerImageCard({
  item,
  animating,
  onAnimate,
}: {
  item: InfluencerContentItem;
  animating: boolean;
  onAnimate: () => void;
}) {
  const isBuilding =
    item.status === "pending" || item.status === "processing";
  const isFailed = item.status === "failed";
  const canAnimate = item.status === "completed" && Boolean(item.mediaUrl);

  return (
    <li className="group relative overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-canvas)]">
      <div className="aspect-[3/4] bg-neutral-100">
        {item.mediaUrl && item.status === "completed" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.mediaUrl}
            alt={item.title ?? "Generated image"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center text-xs text-[var(--studio-muted)]">
            {isFailed ? (
              <span className="text-red-600">{item.error ?? "Failed"}</span>
            ) : (
              <>
                <Loader2 className="mb-2 h-5 w-5 animate-spin" />
                Building…
              </>
            )}
          </div>
        )}
      </div>

      {canAnimate ? (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            disabled={animating}
            onClick={onAnimate}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-100 disabled:opacity-60"
          >
            {animating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Video className="h-4 w-4" />
            )}
            Animate
          </button>
        </div>
      ) : null}

      <div className="p-3">
        <p className="truncate text-sm font-medium">
          {item.title ?? "Influencer image"}
        </p>
        <p className="mt-0.5 text-xs text-[var(--studio-muted)]">
          {isBuilding ? "Building" : isFailed ? "Failed" : "Created"}
        </p>
      </div>
    </li>
  );
}

function VideosTab({
  influencerId,
  portraitUrl,
}: {
  influencerId: string;
  portraitUrl: string | null;
}) {
  const { data, isLoading } = useInfluencerVideos(influencerId);
  const { data: imagesData } = useInfluencerImages(influencerId);
  const generate = useGenerateInfluencerVideo(influencerId);
  const [mode, setMode] = useState<InfluencerVideoMode>("image_to_video");
  const [instructions, setInstructions] = useState("");
  const [script, setScript] = useState("");
  const [sourceContentItemId, setSourceContentItemId] = useState<string | null>(
    null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const items = data?.items ?? [];
  const imageSources = (imagesData?.items ?? []).filter(
    (item) => item.status === "completed" && item.mediaUrl,
  );

  const selectedImage = imageSources.find(
    (item) => item.id === sourceContentItemId,
  );

  const handleGenerate = async () => {
    setFormError(null);
    try {
      await generate.mutateAsync({
        mode,
        sourceContentItemId: sourceContentItemId ?? undefined,
        instructions:
          mode === "image_to_video" && instructions.trim()
            ? instructions.trim()
            : undefined,
        script:
          mode === "talking_head" && script.trim() ? script.trim() : undefined,
      });
      if (mode === "image_to_video") {
        setInstructions("");
      } else {
        setScript("");
      }
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not generate video"));
    }
  };

  const canGenerate =
    mode === "talking_head"
      ? script.trim().length > 0 && Boolean(portraitUrl || sourceContentItemId)
      : Boolean(portraitUrl || sourceContentItemId);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-canvas)] p-5">
        <h2 className="text-sm font-semibold">Generate video</h2>
        <p className="mt-1 text-sm text-[var(--studio-muted)]">
          Choose image-to-video or talking head. Portrait is used when no
          source image is selected.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <ModeButton
            active={mode === "image_to_video"}
            onClick={() => setMode("image_to_video")}
            label="Image to video"
          />
          <ModeButton
            active={mode === "talking_head"}
            onClick={() => setMode("talking_head")}
            label="Talking head"
          />
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-[var(--studio-muted)]">
            Source image
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {portraitUrl && !sourceContentItemId ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[var(--studio-border)] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portraitUrl}
                  alt="Portrait"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-center text-[10px] text-white">
                  Portrait
                </span>
              </div>
            ) : null}
            {selectedImage ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[var(--studio-border)] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage.mediaUrl!}
                  alt={selectedImage.title ?? "Source image"}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSourceContentItemId(null)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                  aria-label="Clear source image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null}
            {imageSources.length > 0 ? (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex h-16 min-w-[5rem] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--studio-border)] bg-white px-3 text-[var(--studio-muted)] hover:border-neutral-400 hover:text-[var(--studio-ink)]"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="mt-1 text-[10px]">From images</span>
              </button>
            ) : null}
          </div>
        </div>

        {mode === "image_to_video" ? (
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Motion instructions (optional) — e.g. slow zoom, hair blowing in wind"
            rows={3}
            className="mt-4 w-full rounded-xl border border-[var(--studio-border)] bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400"
          />
        ) : (
          <textarea
            value={script}
            onChange={(event) => setScript(event.target.value)}
            placeholder="Script — what should the influencer say?"
            rows={4}
            className="mt-4 w-full rounded-xl border border-[var(--studio-border)] bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400"
          />
        )}

        {formError ? (
          <p className="mt-3 text-sm text-red-600">{formError}</p>
        ) : null}

        <Button
          className="mt-4 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-neutral-300"
          disabled={generate.isPending || !canGenerate}
          onClick={handleGenerate}
        >
          {generate.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </section>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-[var(--studio-muted)]">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading videos…
        </div>
      ) : items.length === 0 ? (
        <TabShell
          icon={Video}
          title="No videos yet"
          body="Generate a video above, or hover an image and choose Animate."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <InfluencerVideoCard key={item.id} item={item} />
          ))}
        </ul>
      )}

      {pickerOpen ? (
        <SourceImagePickerModal
          images={imageSources}
          onClose={() => setPickerOpen(false)}
          onSelect={(id) => {
            setSourceContentItemId(id);
            setPickerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function ModeButton({
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
          : "border border-[var(--studio-border)] bg-white text-[var(--studio-muted)] hover:text-[var(--studio-ink)]",
      )}
    >
      {label}
    </button>
  );
}

function SourceImagePickerModal({
  images,
  onClose,
  onSelect,
}: {
  images: InfluencerContentItem[];
  onClose: () => void;
  onSelect: (contentItemId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--studio-border)] px-5 py-4">
          <h3 className="text-sm font-semibold">Pick a source image</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto p-5">
          {images.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="block w-full overflow-hidden rounded-xl border border-[var(--studio-border)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.mediaUrl!}
                  alt={item.title ?? "Influencer image"}
                  className="aspect-[3/4] w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function InfluencerVideoCard({ item }: { item: InfluencerContentItem }) {
  const typeLabel =
    item.jobType === "influencer_talking_head"
      ? "Talking head"
      : "Image to video";

  return (
    <li className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-canvas)]">
      <div className="aspect-[9/16] bg-neutral-100">
        {item.mediaUrl && item.status === "completed" ? (
          <video
            src={item.mediaUrl}
            className="h-full w-full object-cover"
            controls
            playsInline
          />
        ) : item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover opacity-70"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center text-xs text-[var(--studio-muted)]">
            {item.status === "failed" ? (
              <span className="text-red-600">{item.error ?? "Failed"}</span>
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
        <p className="truncate text-sm font-medium">
          {item.title ?? "Influencer video"}
        </p>
        <p className="mt-0.5 text-xs text-[var(--studio-muted)]">
          {typeLabel} ·{" "}
          {item.status === "completed"
            ? "Created"
            : item.status === "failed"
              ? "Failed"
              : "Building"}
        </p>
      </div>
    </li>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ImageIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-neutral-900 text-white"
          : "text-[var(--studio-muted)] hover:bg-neutral-100 hover:text-[var(--studio-ink)]",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function TabShell({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ImageIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--studio-border)] bg-[var(--studio-canvas)] px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
        <Icon className="h-6 w-6 text-[var(--studio-muted)]" />
      </div>
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--studio-muted)]">{body}</p>
    </div>
  );
}

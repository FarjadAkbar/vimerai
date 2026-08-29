"use client";

import { useRef, useState } from "react";
import {
  Download,
  ImagePlus,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { BlitzSelectImagesModal } from "@/components/studio/blitz-select-images-modal";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import type {
  AiImageAspectRatio,
  AiImageContentItem,
  AiImageGenerationMode,
  AiImageOutputFormat,
} from "@/lib/api/ai-images.api";
import {
  useAiImages,
  useGenerateAiImage,
  useRegenerateAiImage,
} from "@/lib/hooks/use-ai-images";
import {
  useUploadMediaAsset,
} from "@/lib/hooks/use-media-assets";
import { cn } from "@/lib/utils";

const IMAGE_JOB_CREDIT_COST = 1;
const MAX_REFERENCE_IMAGES = 4;

type ReferenceChip = {
  id: string;
  url: string;
  name: string;
};

const ASPECT_RATIO_OPTIONS: { value: AiImageAspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1" },
  { value: "9:16", label: "9:16" },
  { value: "16:9", label: "16:9" },
  { value: "4:5", label: "4:5" },
];

const FORMAT_OPTIONS: { value: AiImageOutputFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
];

const MODE_OPTIONS: { value: AiImageGenerationMode; label: string }[] = [
  { value: "enhanced", label: "Enhanced" },
  { value: "direct", label: "Direct" },
];

export default function StudioImagesPage() {
  const { data: jobsData } = useAiImages();
  const generate = useGenerateAiImage();
  const regenerate = useRegenerateAiImage();
  const uploadMedia = useUploadMediaAsset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recentJobs = jobsData?.items ?? [];

  const [instructions, setInstructions] = useState("");
  const [references, setReferences] = useState<ReferenceChip[]>([]);
  const [activeJob, setActiveJob] = useState<AiImageContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AiImageAspectRatio>("1:1");
  const [outputFormat, setOutputFormat] =
    useState<AiImageOutputFormat>("png");
  const [generationMode, setGenerationMode] =
    useState<AiImageGenerationMode>("enhanced");

  const busy = generate.isPending || regenerate.isPending || uploadMedia.isPending;
  const previewReady =
    activeJob?.status === "completed" && !!activeJob.mediaUrl;
  const canGenerate =
    instructions.trim().length > 0 && references.length > 0 && !busy;

  const addReference = (selection: { id: string; url: string; name: string }) => {
    setReferences((current) => {
      if (
        current.length >= MAX_REFERENCE_IMAGES ||
        current.some((ref) => ref.id === selection.id)
      ) {
        return current;
      }
      return [...current, selection];
    });
  };

  const onUploadReference = async (file: File) => {
    if (references.length >= MAX_REFERENCE_IMAGES) return;
    setError(null);
    try {
      const result = await uploadMedia.mutateAsync(file);
      addReference({
        id: result.asset.id,
        url: result.asset.url,
        name: result.asset.name,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload reference image"));
    }
  };

  const onGenerate = async () => {
    if (!canGenerate) return;
    setError(null);
    try {
      const result = await generate.mutateAsync({
        instructions: instructions.trim(),
        referenceMediaAssetIds: references.map((ref) => ref.id),
        aspectRatio,
        outputFormat,
        generationMode,
      });
      setActiveJob(result.item);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not generate image"));
    }
  };

  const onRegenerate = async () => {
    if (!activeJob) return;
    setError(null);
    try {
      const result = await regenerate.mutateAsync(activeJob.jobId);
      setActiveJob(result.item);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not regenerate image"));
    }
  };

  const onExport = async () => {
    if (!activeJob?.mediaUrl) return;
    const response = await fetch(activeJob.mediaUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ai-image-${activeJob.id.slice(0, 8)}.${outputFormat}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-3xl flex-col">
      <div className="flex-1">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            AI Image Generator
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--studio-muted)]">
            Describe the image you want to create or edit. Add reference images
            from your Media Store to guide style, product, or composition.
          </p>
          <p className="mt-2 text-xs text-[var(--studio-muted)]">
            Costs {IMAGE_JOB_CREDIT_COST} credit per generation
          </p>
        </div>

        {error ? (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        ) : null}

        {(previewReady || activeJob?.status === "failed" || busy) &&
        activeJob ? (
          <section className="mt-10">
            <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
              Result
            </h2>
            <div className="mt-4 flex flex-col items-center">
              <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-neutral-100 shadow-lg">
                {previewReady ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeJob.mediaUrl!}
                    alt="Generated"
                    className="h-full w-full object-cover"
                  />
                ) : activeJob.status === "failed" ? (
                  <div className="flex h-full items-center justify-center p-6 text-center text-sm text-red-600">
                    {activeJob.error ?? "Generation failed"}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--studio-muted)]" />
                  </div>
                )}
              </div>

              {previewReady ? (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={busy}
                    onClick={onRegenerate}
                  >
                    {regenerate.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Regenerate
                  </Button>
                  <Button
                    className="rounded-full bg-[var(--studio-ink)] text-white hover:bg-black"
                    onClick={onExport}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {recentJobs.length > 0 ? (
          <section className="mt-12 border-t border-[var(--studio-border)] pt-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
              Recent Generations
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentJobs.slice(0, 9).map((job) => (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveJob(job);
                      setError(null);
                    }}
                    className={cn(
                      "w-full overflow-hidden rounded-2xl border text-left transition",
                      activeJob?.id === job.id
                        ? "border-[var(--studio-ink)] bg-white"
                        : "border-[var(--studio-border)] bg-white/70 hover:border-black/20",
                    )}
                  >
                    {job.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={job.mediaUrl}
                        alt=""
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-neutral-100 text-xs text-[var(--studio-muted)]">
                        {job.status}
                      </div>
                    )}
                    <p className="line-clamp-2 px-3 py-2 text-xs text-[var(--studio-muted)]">
                      {job.title ?? "AI Image"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <div className="sticky bottom-4 z-20 mt-8 shrink-0">
        <div className="relative rounded-3xl border border-[var(--studio-border)] bg-white/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md sm:p-5">
          <div
            className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent"
            aria-hidden
          />

          <div className="flex gap-4">
            <div className="flex shrink-0 flex-col gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--studio-muted)]">
                Image Refs
              </p>
              <div className="flex flex-col gap-2">
                {references.map((ref) => (
                  <div
                    key={ref.id}
                    className="group relative h-16 w-16 overflow-hidden rounded-xl border border-[var(--studio-border)] bg-neutral-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ref.url}
                      alt={ref.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Remove reference"
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                      onClick={() =>
                        setReferences((prev) =>
                          prev.filter((item) => item.id !== ref.id),
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {references.length < MAX_REFERENCE_IMAGES ? (
                  <>
                    <button
                      type="button"
                      disabled={uploadMedia.isPending}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--studio-border)] bg-neutral-50 text-[var(--studio-muted)] transition hover:border-[var(--studio-ink)] hover:text-[var(--studio-ink)] disabled:opacity-50"
                    >
                      {uploadMedia.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <ImagePlus className="h-5 w-5" />
                          <span className="text-[10px]">Upload</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--studio-border)] bg-neutral-50 text-[var(--studio-muted)] transition hover:border-[var(--studio-ink)] hover:text-[var(--studio-ink)]"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px]">Library</span>
                    </button>
                  </>
                ) : null}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void onUploadReference(file);
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Describe the image you want to create or edit. Example: A premium perfume ad on silver silk with cinematic lighting."
                rows={5}
                className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-[var(--studio-muted)]"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--studio-border)] pt-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--studio-muted)]">
              <OptionGroup
                label="Ratio"
                options={ASPECT_RATIO_OPTIONS}
                value={aspectRatio}
                onChange={setAspectRatio}
              />
              <OptionGroup
                label="Format"
                options={FORMAT_OPTIONS}
                value={outputFormat}
                onChange={setOutputFormat}
              />
              <OptionGroup
                label="Mode"
                options={MODE_OPTIONS}
                value={generationMode}
                onChange={setGenerationMode}
              />
              {references.length > 0 ? (
                <span>
                  {references.length} ref
                  {references.length !== 1 ? "s" : ""}
                </span>
              ) : (
                <span>Add at least 1 reference</span>
              )}
            </div>

            <Button
              className="rounded-full bg-gradient-to-r from-sky-500 to-orange-400 px-5 text-white hover:from-sky-600 hover:to-orange-500"
              disabled={!canGenerate}
              onClick={onGenerate}
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate · {IMAGE_JOB_CREDIT_COST} credit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <BlitzSelectImagesModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addReference}
      />
    </div>
  );
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="mr-1">{label}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full border px-2.5 py-1 transition",
            value === option.value
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-[var(--studio-border)] bg-white hover:border-neutral-400",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

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
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ImageJob } from "@/lib/api/image-jobs.api";
import {
  useCreateImageJob,
  useImageJobs,
  useRegenerateImageJob,
} from "@/lib/hooks/use-image-jobs";
import { useUploadProductImage } from "@/lib/hooks/use-products";

const IMAGE_JOB_CREDIT_COST = 1;
const MAX_REFERENCE_IMAGES = 4;

export default function StudioImagesPage() {
  const { data: jobsData } = useImageJobs();
  const createJob = useCreateImageJob();
  const regenerateJob = useRegenerateImageJob();
  const uploadImage = useUploadProductImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recentJobs = jobsData?.imageJobs ?? [];

  const [prompt, setPrompt] = useState("");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [activeJob, setActiveJob] = useState<ImageJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingRef, setUploadingRef] = useState(false);

  const busy = createJob.isPending || regenerateJob.isPending || uploadingRef;
  const previewReady =
    activeJob?.status === "completed" && !!activeJob.imageUrl;
  const canGenerate =
    prompt.trim().length > 0 && referenceUrls.length > 0 && !busy;

  const onUploadReference = async (file: File) => {
    if (referenceUrls.length >= MAX_REFERENCE_IMAGES) return;
    setUploadingRef(true);
    setError(null);
    try {
      const result = await uploadImage.mutateAsync(file);
      setReferenceUrls((prev) => [...prev, result.imageUrl]);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload reference image"));
    } finally {
      setUploadingRef(false);
    }
  };

  const onGenerate = async () => {
    if (!canGenerate) return;
    setError(null);
    try {
      const result = await createJob.mutateAsync({
        prompt: prompt.trim(),
        referenceImageUrls: referenceUrls,
      });
      setActiveJob(result.imageJob);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not generate image"));
    }
  };

  const onRegenerate = async () => {
    if (!activeJob) return;
    setError(null);
    try {
      const result = await regenerateJob.mutateAsync(activeJob.id);
      setActiveJob(result.imageJob);
      setPrompt(result.imageJob.prompt);
      setReferenceUrls(result.imageJob.referenceImageUrls);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not regenerate image"));
    }
  };

  const onExport = async () => {
    if (!activeJob?.imageUrl) return;
    const response = await fetch(activeJob.imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ai-image-${activeJob.id.slice(0, 8)}.png`;
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
            to guide style, product, or composition.
          </p>
          <p className="mt-2 text-xs text-[var(--studio-muted)]">
            Costs {IMAGE_JOB_CREDIT_COST} credit per generation · 1:1 output
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
                    src={activeJob.imageUrl!}
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
                    {regenerateJob.isPending ? (
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
                      setPrompt(job.prompt);
                      setReferenceUrls(job.referenceImageUrls);
                      setError(null);
                    }}
                    className={`w-full overflow-hidden rounded-2xl border text-left transition ${
                      activeJob?.id === job.id
                        ? "border-[var(--studio-ink)] bg-white"
                        : "border-[var(--studio-border)] bg-white/70 hover:border-black/20"
                    }`}
                  >
                    {job.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={job.imageUrl}
                        alt=""
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-neutral-100 text-xs text-[var(--studio-muted)]">
                        {job.status}
                      </div>
                    )}
                    <p className="line-clamp-2 px-3 py-2 text-xs text-[var(--studio-muted)]">
                      {job.prompt}
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
                {referenceUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="group relative h-16 w-16 overflow-hidden rounded-xl border border-[var(--studio-border)] bg-neutral-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Reference ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Remove reference"
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                      onClick={() =>
                        setReferenceUrls((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {referenceUrls.length < MAX_REFERENCE_IMAGES ? (
                  <button
                    type="button"
                    disabled={uploadingRef}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--studio-border)] bg-neutral-50 text-[var(--studio-muted)] transition hover:border-[var(--studio-ink)] hover:text-[var(--studio-ink)] disabled:opacity-50"
                  >
                    {uploadingRef ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-[10px]">Add</span>
                      </>
                    )}
                  </button>
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
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe the image you want to create or edit. Example: A premium perfume ad on silver silk with cinematic lighting."
                rows={5}
                className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-[var(--studio-muted)]"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--studio-border)] pt-4">
            <div className="flex items-center gap-2 text-xs text-[var(--studio-muted)]">
              <span className="rounded-full border border-[var(--studio-border)] px-2.5 py-1">
                1:1
              </span>
              <span className="rounded-full border border-[var(--studio-border)] px-2.5 py-1">
                PNG
              </span>
              {referenceUrls.length > 0 ? (
                <span>
                  {referenceUrls.length} ref
                  {referenceUrls.length !== 1 ? "s" : ""}
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
              {createJob.isPending ? (
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
    </div>
  );
}

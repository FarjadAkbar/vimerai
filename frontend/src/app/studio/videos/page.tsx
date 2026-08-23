"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  CircleHelp,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  User,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  REMIX_STEPS,
  VIRAL_REMIX_TEMPLATES,
} from "@/components/studio/viral-remix-data";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { VideoJob } from "@/lib/api/video-jobs.api";
import { PRODUCT_PATH } from "@/lib/product-path";
import { useBrandKits } from "@/lib/hooks/use-brand-kits";
import { useUploadProductImage } from "@/lib/hooks/use-products";
import {
  useCreateVideoJob,
  useRegenerateVideoJob,
  useUploadReferenceVideo,
  useVideoJobs,
} from "@/lib/hooks/use-video-jobs";

const VIDEO_JOB_CREDIT_COST = 2;

export default function StudioVideosPage() {
  const { data: brandsData } = useBrandKits();
  const { data: jobsData } = useVideoJobs();
  const createJob = useCreateVideoJob();
  const regenerateJob = useRegenerateVideoJob();
  const uploadReference = useUploadReferenceVideo();
  const uploadImage = useUploadProductImage();

  const brands = brandsData?.brandKits ?? [];
  const recentJobs = jobsData?.videoJobs ?? [];
  const hasBrand = brands.length > 0;

  const refVideoInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);

  const [formatId, setFormatId] = useState<string>(
    VIRAL_REMIX_TEMPLATES[0].id,
  );
  const [referenceVideoUrl, setReferenceVideoUrl] = useState<string | null>(
    null,
  );
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [personImageUrl, setPersonImageUrl] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");
  const [activeJob, setActiveJob] = useState<VideoJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<
    "video" | "product" | "person" | null
  >(null);

  const busy =
    createJob.isPending ||
    regenerateJob.isPending ||
    uploadingSlot !== null;

  const canGenerate =
    hasBrand &&
    Boolean(referenceVideoUrl) &&
    Boolean(productImageUrl || personImageUrl) &&
    !busy;

  const previewReady = activeJob?.status === "completed" && !!activeJob.videoUrl;
  const showGettingStarted = !previewReady && recentJobs.length === 0;

  const onUploadReferenceVideo = async (file: File) => {
    setUploadingSlot("video");
    setError(null);
    try {
      const result = await uploadReference.mutateAsync(file);
      setReferenceVideoUrl(result.videoUrl);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload reference video"));
    } finally {
      setUploadingSlot(null);
    }
  };

  const onUploadProductImage = async (file: File) => {
    setUploadingSlot("product");
    setError(null);
    try {
      const result = await uploadImage.mutateAsync(file);
      setProductImageUrl(result.imageUrl);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload product image"));
    } finally {
      setUploadingSlot(null);
    }
  };

  const onUploadPersonImage = async (file: File) => {
    setUploadingSlot("person");
    setError(null);
    try {
      const result = await uploadImage.mutateAsync(file);
      setPersonImageUrl(result.imageUrl);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload person image"));
    } finally {
      setUploadingSlot(null);
    }
  };

  const onGenerate = async () => {
    if (!canGenerate || !referenceVideoUrl) return;
    setError(null);
    try {
      const result = await createJob.mutateAsync({
        formatId,
        referenceVideoUrl,
        productImageUrl: productImageUrl ?? undefined,
        personImageUrl: personImageUrl ?? undefined,
        instructions: instructions.trim() || undefined,
        brandId: brands[0]?.id,
      });
      setActiveJob(result.videoJob);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not start Viral Remix"));
    }
  };

  const onRegenerate = async () => {
    if (!activeJob) return;
    setError(null);
    try {
      const result = await regenerateJob.mutateAsync(activeJob.id);
      setActiveJob(result.videoJob);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not regenerate remix"));
    }
  };

  const onExport = async () => {
    if (!activeJob?.videoUrl) return;
    const response = await fetch(activeJob.videoUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `viral-remix-${activeJob.id.slice(0, 8)}.mp4`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Viral Remix</h1>
          <CircleHelp className="h-4 w-4 text-[var(--studio-muted)]" />
        </div>

        {!hasBrand ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <h2 className="text-xl font-semibold tracking-tight">
              Generate Business DNA first
            </h2>
            <p className="mt-2 max-w-md text-sm text-[var(--studio-muted)]">
              A Brand is required before you can run Viral Remix.
            </p>
            <Button
              asChild
              className="mt-6 rounded-full bg-[var(--studio-ink)] text-white hover:bg-black"
            >
              <Link href={PRODUCT_PATH.businessDna}>Business DNA</Link>
            </Button>
          </div>
        ) : (
          <>
            {showGettingStarted ? (
              <section className="mt-10 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Get started with Viral Remix
                </h2>
                <p className="mt-2 text-sm text-[var(--studio-muted)]">
                  Add your own assets and generate a remix video in one click.
                </p>
                <div className="mt-10 grid gap-6 sm:grid-cols-3">
                  {REMIX_STEPS.map((step, index) => (
                    <div
                      key={step.title}
                      className="rounded-2xl border border-[var(--studio-border)] bg-white/80 px-5 py-6"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--studio-muted)]">
                        {step.body}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-10">
              <h2 className="text-sm font-medium text-[var(--studio-ink)]">
                Viral Remix Templates
              </h2>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {VIRAL_REMIX_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setFormatId(template.id)}
                    className={`relative h-44 w-28 shrink-0 overflow-hidden rounded-2xl border transition ${
                      formatId === template.id
                        ? "border-[var(--studio-ink)] ring-2 ring-[var(--studio-ink)]/20"
                        : "border-transparent hover:border-black/10"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-b ${template.gradient}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-left text-[11px] font-medium leading-tight text-white">
                        {template.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {previewReady || activeJob?.status === "failed" ? (
              <section className="mt-10">
                <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
                  Remix result
                </h2>
                <div className="mt-4 flex flex-col items-center">
                  <div className="relative aspect-[9/16] w-full max-w-xs overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-black shadow-lg">
                    {previewReady ? (
                      <video
                        key={activeJob!.videoUrl!}
                        src={activeJob!.videoUrl!}
                        className="h-full w-full object-cover"
                        controls
                        playsInline
                        loop
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-red-500">
                        {activeJob?.error ?? "Remix failed"}
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

            {recentJobs.length > 0 && !previewReady ? (
              <section className="mt-10 border-t border-[var(--studio-border)] pt-8">
                <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
                  Recent remixes
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                  {recentJobs.slice(0, 6).map((job) => (
                    <li key={job.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveJob(job);
                          setFormatId(job.formatId);
                          if (job.snapshot.viralRemix) {
                            setReferenceVideoUrl(
                              job.snapshot.viralRemix.referenceVideoUrl,
                            );
                            setProductImageUrl(
                              job.snapshot.viralRemix.productImageUrl,
                            );
                            setPersonImageUrl(
                              job.snapshot.viralRemix.personImageUrl,
                            );
                            setInstructions(
                              job.snapshot.viralRemix.instructions ?? "",
                            );
                          }
                        }}
                        className="w-full rounded-2xl border border-[var(--studio-border)] bg-white/70 px-4 py-3 text-left hover:border-black/20"
                      >
                        <p className="text-sm font-medium">
                          {job.snapshot.format.label}
                        </p>
                        <p className="mt-1 text-xs text-[var(--studio-muted)]">
                          {job.status}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>

      {hasBrand ? (
        <div className="sticky bottom-4 z-20 mt-8 shrink-0">
          <div className="rounded-3xl border border-[var(--studio-border)] bg-white/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex shrink-0 gap-3">
                <AssetSlot
                  label="Ref Video"
                  required
                  icon={Video}
                  previewUrl={referenceVideoUrl}
                  uploading={uploadingSlot === "video"}
                  onClear={() => setReferenceVideoUrl(null)}
                  onClick={() => refVideoInputRef.current?.click()}
                />
                <AssetSlot
                  label="Product"
                  icon={Box}
                  previewUrl={productImageUrl}
                  uploading={uploadingSlot === "product"}
                  onClear={() => setProductImageUrl(null)}
                  onClick={() => productInputRef.current?.click()}
                />
                <AssetSlot
                  label="Person"
                  icon={User}
                  previewUrl={personImageUrl}
                  uploading={uploadingSlot === "person"}
                  onClear={() => setPersonImageUrl(null)}
                  onClick={() => personInputRef.current?.click()}
                />
              </div>

              <div className="min-w-0 flex-1">
                <textarea
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  placeholder="Describe the hook, pacing, camera, message, or other requirements (optional)."
                  rows={4}
                  className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-[var(--studio-muted)]"
                />
                <p className="mt-2 text-xs text-[var(--studio-muted)]">
                  Tips: 1. A reference video is required. 2. Upload at least one
                  Product or Person image.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--studio-border)] pt-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Pill>Seedance 2.0</Pill>
                <Pill>9:16</Pill>
                <Pill>720p</Pill>
                <Pill>~20s</Pill>
                <span className="text-[var(--studio-muted)]">
                  {VIDEO_JOB_CREDIT_COST} credits
                </span>
              </div>

              <Button
                className="rounded-full bg-neutral-900 px-6 text-white hover:bg-black disabled:bg-neutral-300"
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
                    Generate Remix Video
                  </>
                )}
              </Button>
            </div>

            {error ? (
              <p className="mt-3 text-center text-sm text-red-600">{error}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <input
        ref={refVideoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void onUploadReferenceVideo(file);
        }}
      />
      <input
        ref={productInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void onUploadProductImage(file);
        }}
      />
      <input
        ref={personInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void onUploadPersonImage(file);
        }}
      />
    </div>
  );
}

function AssetSlot({
  label,
  required,
  icon: Icon,
  previewUrl,
  uploading,
  onClick,
  onClear,
}: {
  label: string;
  required?: boolean;
  icon: typeof Video;
  previewUrl: string | null;
  uploading: boolean;
  onClick: () => void;
  onClear: () => void;
}) {
  const isVideo = label === "Ref Video";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={uploading}
        className="relative flex h-28 w-24 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-[var(--studio-border)] bg-neutral-50 transition hover:border-[var(--studio-ink)] disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-[var(--studio-muted)]" />
        ) : previewUrl ? (
          isVideo ? (
            <video
              src={previewUrl}
              className="absolute inset-0 h-full w-full rounded-2xl object-cover"
              muted
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={label}
              className="absolute inset-0 h-full w-full rounded-2xl object-cover"
            />
          )
        ) : (
          <>
            <Icon className="h-5 w-5 text-[var(--studio-muted)]" />
            <Upload className="h-4 w-4 text-[var(--studio-muted)]" />
          </>
        )}
        <span className="relative z-[1] rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium">
          {label}
          {required ? " *" : ""}
        </span>
      </button>
      {previewUrl ? (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--studio-border)] px-2.5 py-1 text-[var(--studio-muted)]">
      {children}
    </span>
  );
}

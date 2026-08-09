"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { Format } from "@/lib/api/formats.api";
import {
  REEL_PLATFORM_OPTIONS,
  type ReelPlatform,
  type VideoJob,
} from "@/lib/api/video-jobs.api";
import { useBrandKits } from "@/lib/hooks/use-brand-kits";
import { useFormats } from "@/lib/hooks/use-formats";
import { useProducts } from "@/lib/hooks/use-products";
import {
  useCreateVideoJob,
  useRegenerateVideoJob,
  useVideoJobs,
} from "@/lib/hooks/use-video-jobs";

const VIDEO_JOB_CREDIT_COST = 2;

export default function StudioVideosPage() {
  const { data: brandsData } = useBrandKits();
  const { data: productsData } = useProducts();
  const { data: formatsData, isLoading: formatsLoading } = useFormats("video");
  const { data: jobsData } = useVideoJobs();
  const createJob = useCreateVideoJob();
  const regenerateJob = useRegenerateVideoJob();

  const brands = brandsData?.brandKits ?? [];
  const products = productsData?.products ?? [];
  const formats = formatsData?.formats ?? [];
  const recentJobs = jobsData?.videoJobs ?? [];

  const [brandId, setBrandId] = useState("");
  const [productId, setProductId] = useState("");
  const [formatId, setFormatId] = useState("");
  const [reelPlatform, setReelPlatform] =
    useState<ReelPlatform>("instagram_reels");
  const [activeJob, setActiveJob] = useState<VideoJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId && brands[0]) setBrandId(brands[0].id);
  }, [brands, brandId]);

  useEffect(() => {
    if (!productId && products[0]) setProductId(products[0].id);
  }, [products, productId]);

  useEffect(() => {
    if (!formatId && formats[0]) setFormatId(formats[0].id);
  }, [formats, formatId]);

  useEffect(() => {
    if (!activeJob && recentJobs[0]) {
      setActiveJob(recentJobs[0]);
    }
  }, [recentJobs, activeJob]);

  const selectedBrand = brands.find((b) => b.id === brandId);
  const selectedProduct = products.find((p) => p.id === productId);
  const selectedFormat = formats.find((f) => f.id === formatId);
  const platformLabel =
    REEL_PLATFORM_OPTIONS.find((option) => option.value === reelPlatform)
      ?.label ?? reelPlatform;

  const canGenerate =
    Boolean(brandId && productId && formatId && reelPlatform) &&
    !createJob.isPending &&
    !regenerateJob.isPending;

  const onGenerate = async () => {
    if (!brandId || !productId || !formatId) return;
    setError(null);
    try {
      const result = await createJob.mutateAsync({
        brandId,
        productId,
        formatId,
        reelPlatform,
      });
      setActiveJob(result.videoJob);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not start Video Job"));
    }
  };

  const onRegenerate = async () => {
    if (!activeJob) return;
    setError(null);
    try {
      const result = await regenerateJob.mutateAsync(activeJob.id);
      setActiveJob(result.videoJob);
      setBrandId(result.videoJob.brandId);
      setProductId(result.videoJob.productId);
      setFormatId(result.videoJob.formatId);
      setReelPlatform(result.videoJob.reelPlatform);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not regenerate Video Job"));
    }
  };

  const onExport = async () => {
    if (!activeJob?.videoUrl) return;
    const response = await fetch(activeJob.videoUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const formatLabel =
      activeJob.snapshot.format.label.replace(/\s+/g, "-").toLowerCase() ||
      "video";
    anchor.href = url;
    anchor.download = `${formatLabel}-${activeJob.id.slice(0, 8)}.mp4`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const busy = createJob.isPending || regenerateJob.isPending;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Videos</h1>
          <p className="mt-1 text-[var(--studio-muted)]">
            Make a Video — pick Brand, Product, Format, and platform, then
            Export the Video. Video Director chat is parked.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            className="rounded-full bg-[var(--studio-ink)] text-white hover:bg-black"
            disabled={!canGenerate}
            onClick={onGenerate}
          >
            {createJob.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate Video"
            )}
          </Button>
          <p className="text-xs text-[var(--studio-muted)]">
            Costs {VIDEO_JOB_CREDIT_COST} credits per Video Job · ~15–30s 9:16
          </p>
        </div>
      </div>

      {!selectedBrand ? (
        <EmptyGuide
          title="Generate Business DNA first"
          body="A Brand is required before you can run a Video Job."
          href="/studio/business-dna"
          cta="Business DNA"
        />
      ) : !selectedProduct ? (
        <EmptyGuide
          title="Add a Product to continue"
          body="Video Jobs need a Product with at least one image so the model can condition on it."
          href="/products"
          cta="Create Product"
        />
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="Brand"
              value={brandId}
              onChange={setBrandId}
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
            />
            <SelectField
              label="Product"
              value={productId}
              onChange={setProductId}
              options={products.map((p) => ({ value: p.id, label: p.name }))}
            />
            <SelectField
              label="Platform"
              value={reelPlatform}
              onChange={(value) => setReelPlatform(value as ReelPlatform)}
              options={REEL_PLATFORM_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
            <div className="flex items-end">
              <Link
                href="/products"
                className="text-sm text-[var(--studio-muted)] underline-offset-2 hover:underline"
              >
                Manage Products
              </Link>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
              Formats
            </h2>
            {formatsLoading ? (
              <p className="mt-3 text-sm text-[var(--studio-muted)]">
                Loading Formats…
              </p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {formats.map((format) => (
                  <FormatCard
                    key={format.id}
                    format={format}
                    selected={format.id === formatId}
                    onSelect={() => setFormatId(format.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="mt-10 flex min-h-[28rem] flex-col items-center justify-center">
            <PhonePreview
              label={
                activeJob?.status === "completed"
                  ? `${platformLabel} preview`
                  : selectedFormat?.label ?? "Video preview"
              }
              title={
                activeJob?.status === "failed"
                  ? "Video Job failed"
                  : (selectedBrand.name ?? "Brand")
              }
              body={
                activeJob?.status === "failed"
                  ? (activeJob.error ?? "Try again")
                  : `${selectedProduct.name} · ${platformLabel}`
              }
              videoUrl={
                activeJob?.status === "completed" ? activeJob.videoUrl : null
              }
              busy={busy}
            />

            {error ? (
              <p className="mt-6 max-w-md text-center text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-full"
                disabled={activeJob?.status !== "completed" || busy}
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
                disabled={
                  activeJob?.status !== "completed" || !activeJob.videoUrl
                }
                onClick={onExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <p className="mt-4 max-w-md text-center text-sm text-[var(--studio-muted)]">
              Regenerate starts a new credited Video Job (
              {VIDEO_JOB_CREDIT_COST} credits) with the same Brand, Product,
              Format, and platform. No AI captions — write those outside the
              app.
            </p>
          </div>

          {recentJobs.length > 0 ? (
            <section className="mt-12 border-t border-[var(--studio-border)] pt-8">
              <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
                Recent Video Jobs
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recentJobs.slice(0, 6).map((job) => (
                  <li key={job.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveJob(job);
                        setBrandId(job.brandId);
                        setProductId(job.productId);
                        setFormatId(job.formatId);
                        setReelPlatform(job.reelPlatform);
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        activeJob?.id === job.id
                          ? "border-[var(--studio-ink)] bg-white"
                          : "border-[var(--studio-border)] bg-white/70 hover:border-black/20"
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {job.snapshot.format.label}
                      </p>
                      <p className="mt-1 text-xs text-[var(--studio-muted)]">
                        {job.snapshot.product.name} ·{" "}
                        {REEL_PLATFORM_OPTIONS.find(
                          (option) => option.value === job.reelPlatform,
                        )?.label ?? job.reelPlatform}{" "}
                        · {job.status}
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
  );
}

function EmptyGuide({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-[var(--studio-muted)]">{body}</p>
      <Button
        asChild
        className="mt-6 rounded-full bg-[var(--studio-ink)] text-white hover:bg-black"
      >
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[var(--studio-muted)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-full border border-[var(--studio-border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--studio-ink)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormatCard({
  format,
  selected,
  onSelect,
}: {
  format: Format;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-2xl border px-4 py-4 text-left transition ${
        selected
          ? "border-[var(--studio-ink)] bg-white shadow-sm"
          : "border-[var(--studio-border)] bg-white/70 hover:border-black/20"
      }`}
    >
      <p className="font-medium">{format.label}</p>
      <p className="mt-1 text-xs text-[var(--studio-muted)]">
        {format.description}
      </p>
      <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[var(--studio-muted)]">
        {format.modality}
      </p>
    </button>
  );
}

function PhonePreview({
  title,
  body,
  label,
  videoUrl,
  busy,
}: {
  title: string;
  body: string;
  label: string;
  videoUrl?: string | null;
  busy?: boolean;
}) {
  return (
    <div className="relative h-[28rem] w-[16rem] overflow-hidden rounded-[1.75rem] border border-black/5 bg-black text-white shadow-xl">
      {videoUrl ? (
        <video
          key={videoUrl}
          src={videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          controls
          playsInline
          loop
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f] to-[#0f172a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
        </div>
      )}
      {busy ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : null}
      {!videoUrl ? (
        <div className="relative z-[1] flex h-full flex-col p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/80">
            {label}
          </p>
          <div className="mt-auto space-y-2 pb-6">
            <p className="text-lg font-semibold leading-snug">{title}</p>
            <p className="text-xs text-white/75">{body}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
              <span className="rounded-full bg-white/15 px-2 py-1">9:16</span>
              <span className="rounded-full bg-white/15 px-2 py-1">15–30s</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/90 drop-shadow">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}

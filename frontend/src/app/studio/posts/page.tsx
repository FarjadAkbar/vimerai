"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Download, Loader2, Pencil, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { Format } from "@/lib/api/formats.api";
import type { PostJob } from "@/lib/api/post-jobs.api";
import { useBrandKits } from "@/lib/hooks/use-brand-kits";
import { useFormats } from "@/lib/hooks/use-formats";
import {
  useCreatePostJob,
  usePostJobs,
  useRegeneratePostJob,
} from "@/lib/hooks/use-post-jobs";
import { useProducts } from "@/lib/hooks/use-products";

const POST_JOB_CREDIT_COST = 1;

export default function StudioPostsPage() {
  const { data: brandsData } = useBrandKits();
  const { data: productsData } = useProducts();
  const { data: formatsData, isLoading: formatsLoading } = useFormats("post");
  const { data: jobsData } = usePostJobs();
  const createJob = useCreatePostJob();
  const regenerateJob = useRegeneratePostJob();

  const brands = brandsData?.brandKits ?? [];
  const products = productsData?.products ?? [];
  const formats = formatsData?.formats ?? [];
  const recentJobs = jobsData?.postJobs ?? [];

  const [brandId, setBrandId] = useState("");
  const [productId, setProductId] = useState("");
  const [formatId, setFormatId] = useState("");
  const [activeJob, setActiveJob] = useState<PostJob | null>(null);
  const [acceptedJobId, setAcceptedJobId] = useState<string | null>(null);
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

  const neighborFormats = useMemo(() => {
    if (formats.length === 0) return { prev: null, next: null };
    const index = formats.findIndex((f) => f.id === formatId);
    if (index < 0) return { prev: formats[0] ?? null, next: formats[1] ?? null };
    return {
      prev: formats[(index - 1 + formats.length) % formats.length] ?? null,
      next: formats[(index + 1) % formats.length] ?? null,
    };
  }, [formats, formatId]);

  const canGenerate =
    Boolean(brandId && productId && formatId) &&
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
      });
      setActiveJob(result.postJob);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not start Post Job"));
    }
  };

  const onRegenerate = async () => {
    if (!activeJob) return;
    setError(null);
    try {
      const result = await regenerateJob.mutateAsync(activeJob.id);
      setActiveJob(result.postJob);
      setBrandId(result.postJob.brandId);
      setProductId(result.postJob.productId);
      setFormatId(result.postJob.formatId);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not regenerate Post Job"));
    }
  };

  const onExport = async () => {
    if (!activeJob?.postImageUrl) return;
    const response = await fetch(activeJob.postImageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const formatLabel =
      activeJob.snapshot.format.label.replace(/\s+/g, "-").toLowerCase() ||
      "post";
    anchor.href = url;
    anchor.download = `${formatLabel}-${activeJob.id.slice(0, 8)}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const busy = createJob.isPending || regenerateJob.isPending;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Posts</h1>
          <p className="mt-1 text-[var(--studio-muted)]">
            Make a Post — pick Brand, Product, and Format, then Export the Post
            image.
          </p>
        </div>
        <div className="flex gap-2">
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
                "Generate Post"
              )}
            </Button>
            <p className="text-xs text-[var(--studio-muted)]">
              Costs {POST_JOB_CREDIT_COST} credit per Post Job
            </p>
          </div>
        </div>
      </div>

      {!selectedBrand ? (
        <EmptyGuide
          title="Generate Business DNA first"
          body="A Brand is required before you can run a Post Job."
          href="/studio/business-dna"
          cta="Business DNA"
        />
      ) : !selectedProduct ? (
        <EmptyGuide
          title="Add a Product to continue"
          body="Post Jobs need a Product with at least one image so the model can condition on it."
          href="/products"
          cta="Create Product"
        />
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="relative flex items-end gap-6">
              {neighborFormats.prev ? (
                <PhoneCard
                  muted
                  label="Format"
                  title={neighborFormats.prev.label}
                  body={neighborFormats.prev.description}
                />
              ) : null}
              <PhoneCard
                featured
                label={
                  activeJob?.status === "completed"
                    ? "Post preview"
                    : selectedFormat?.label ?? "Post preview"
                }
                title={
                  activeJob?.status === "failed"
                    ? "Post Job failed"
                    : selectedBrand.name
                }
                body={
                  activeJob?.status === "failed"
                    ? (activeJob.error ?? "Try again")
                    : selectedProduct.name
                }
                imageUrl={
                  activeJob?.status === "completed"
                    ? activeJob.postImageUrl
                    : null
                }
                busy={busy}
              />
              {neighborFormats.next ? (
                <PhoneCard
                  muted
                  label="Next Format"
                  title={neighborFormats.next.label}
                  body={neighborFormats.next.description}
                />
              ) : null}
            </div>

            {error ? (
              <p className="mt-6 max-w-md text-center text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg disabled:opacity-40"
                aria-label="Reject"
                disabled={activeJob?.status !== "completed" || busy}
                onClick={() => {
                  setActiveJob(null);
                  setAcceptedJobId(null);
                }}
              >
                <X className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium shadow-lg disabled:opacity-40"
                disabled={activeJob?.status !== "completed" || busy}
                onClick={onRegenerate}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg disabled:opacity-40"
                aria-label="Accept"
                disabled={activeJob?.status !== "completed" || busy}
                onClick={() => {
                  if (activeJob) setAcceptedJobId(activeJob.id);
                }}
              >
                <Check className="h-6 w-6" />
              </button>
            </div>

            {acceptedJobId && activeJob?.id === acceptedJobId ? (
              <p className="mt-4 text-sm font-medium text-emerald-700">
                Accepted — ready to Export
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
                  activeJob?.status !== "completed" || !activeJob.postImageUrl
                }
                onClick={onExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <p className="mt-4 max-w-md text-center text-sm text-[var(--studio-muted)]">
              Regenerate starts a new credited Post Job ({POST_JOB_CREDIT_COST}{" "}
              credit) with the same Brand, Product, and Format. No AI captions —
              write those outside the app.
            </p>
          </div>

          {recentJobs.length > 0 ? (
            <section className="mt-12 border-t border-[var(--studio-border)] pt-8">
              <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--studio-muted)]">
                Recent Post Jobs
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
                        {job.snapshot.product.name} · {job.status}
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

function PhoneCard({
  title,
  body,
  label,
  featured,
  muted,
  imageUrl,
  busy,
}: {
  title: string;
  body: string;
  label: string;
  featured?: boolean;
  muted?: boolean;
  imageUrl?: string | null;
  busy?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-black/5 text-white shadow-xl transition ${
        featured
          ? "h-[26rem] w-[15rem] scale-105"
          : muted
            ? "h-[22rem] w-[12rem] opacity-70"
            : "h-[24rem] w-[13rem]"
      } ${imageUrl ? "bg-black" : "bg-gradient-to-b from-[#1e3a5f] to-[#0f172a]"}`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
      )}
      {busy && featured ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : null}
      <div className="relative z-[1] flex h-full flex-col p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/80 drop-shadow">
          {label}
        </p>
        {!imageUrl ? (
          <div className="mt-auto space-y-2 pb-6">
            <p className="text-lg font-semibold leading-snug">{title}</p>
            <p className="text-xs text-white/75">{body}</p>
          </div>
        ) : (
          <div className="mt-auto rounded-xl bg-black/45 px-3 py-2 backdrop-blur-sm">
            <p className="text-sm font-medium leading-snug">{title}</p>
            <p className="text-[11px] text-white/80">{body}</p>
          </div>
        )}
        {featured ? (
          <div className="flex justify-center gap-1 pb-1 pt-3">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

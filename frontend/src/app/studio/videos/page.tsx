"use client";

import Link from "next/link";
import { Box, UserRound, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrandKits } from "@/lib/hooks/use-brand-kits";
import { useProducts } from "@/lib/hooks/use-products";

export default function StudioVideosPage() {
  const { data: brands } = useBrandKits();
  const { data: products } = useProducts();
  const brand = brands?.brandKits[0];
  const product = products?.products[0];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight">Videos</h1>
      <p className="mt-1 text-[var(--studio-muted)]">
        Make a Video — Viral Remix–like assets + generate. Separate from Posts.
        Video Director chat is parked.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-[var(--studio-chip)] px-3 py-1.5">
          Brand:{" "}
          <strong className="font-medium">
            {brand?.name ?? "Generate Business DNA"}
          </strong>
        </span>
        <span className="rounded-full bg-[var(--studio-chip)] px-3 py-1.5">
          Product:{" "}
          <strong className="font-medium">
            {product?.name ?? "Add a Product"}
          </strong>
        </span>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <StepCard
          step="1"
          title="Choose assets"
          body="Reference style optional later; Product images condition the Video Job."
        />
        <StepCard
          step="2"
          title="Generate"
          body="Run a Video Job for ~15–30s 9:16 (Reels or TikTok)."
        />
        <StepCard
          step="3"
          title="Preview & Export"
          body="Play in a phone frame, then download — no in-app publish."
        />
      </section>

      <section className="mt-8 rounded-3xl border border-[var(--studio-border)] bg-white p-6 shadow-[0_18px_40px_rgba(30,58,95,0.08)]">
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="grid grid-cols-3 gap-3">
            <UploadSlot icon={Video} label="Ref video" hint="Optional MVP" />
            <UploadSlot icon={Box} label="Product" hint={product?.name ?? "Required"} />
            <UploadSlot icon={UserRound} label="Person" hint="Optional" />
          </div>
          <div className="flex flex-col rounded-2xl bg-[var(--studio-panel)] p-4">
            <p className="text-sm font-medium">Optional instructions</p>
            <textarea
              className="mt-2 min-h-28 flex-1 resize-none rounded-xl border border-[var(--studio-border)] bg-white p-3 text-sm outline-none"
              placeholder="Describe the hook, pacing, camera, or message…"
              disabled
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <SpecChip label="Aspect" value="9:16" />
            <SpecChip label="Duration" value="15–30s" />
            <SpecChip label="Platform" value="Reels / TikTok" />
          </div>
          <Button disabled className="rounded-full bg-[var(--studio-ink)] text-white">
            Generate Video
          </Button>
        </div>
      </section>

      <p className="mt-6 text-sm text-[var(--studio-muted)]">
        Video Job wiring lands in ticket 04. This page keeps the Video entry
        clear and separate from Posts.
      </p>
      <div className="mt-4 flex gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/studio/posts">Back to Posts</Link>
        </Button>
        <Button asChild className="rounded-full bg-[var(--studio-ink)] text-white hover:bg-black">
          <Link href="/studio/business-dna">Business DNA</Link>
        </Button>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl bg-[var(--studio-panel)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--studio-accent)]">
        Step {step}
      </p>
      <p className="mt-2 font-medium">{title}</p>
      <p className="mt-1 text-sm text-[var(--studio-muted)]">{body}</p>
    </div>
  );
}

function UploadSlot({
  icon: Icon,
  label,
  hint,
}: {
  icon: typeof Video;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--studio-border)] bg-[var(--studio-canvas)] p-3 text-center">
      <Icon className="h-5 w-5 text-[var(--studio-muted)]" />
      <p className="mt-2 text-sm font-medium">{label}</p>
      <p className="text-xs text-[var(--studio-muted)]">{hint}</p>
    </div>
  );
}

function SpecChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-[var(--studio-chip)] px-3 py-1.5">
      <span className="text-[var(--studio-muted)]">{label}: </span>
      {value}
    </span>
  );
}

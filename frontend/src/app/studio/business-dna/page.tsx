"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGenerateBusinessDna } from "@/lib/hooks/use-brand-kits";
import type { BrandKit } from "@/lib/api/brand-kits.api";

type Phase = "enter" | "generating" | "overview";
type OverviewTab = "overview" | "details";

const LOADING_STEPS = [
  "Reading your homepage",
  "Learning your tone of voice",
  "Extracting brand colors",
  "Crafting your Brand Overview",
] as const;

export default function BusinessDnaPage() {
  const router = useRouter();
  const generate = useGenerateBusinessDna();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("enter");
  const [stepIndex, setStepIndex] = useState(0);
  const [brand, setBrand] = useState<BrandKit | null>(null);
  const [tab, setTab] = useState<OverviewTab>("overview");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "generating") return;
    const id = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [phase]);

  const palette = useMemo(() => {
    if (!brand) return [] as string[];
    const dna = brand.businessDna?.colorPalette ?? [];
    return Array.from(
      new Set([brand.colors.primary, brand.colors.secondary, ...dna]),
    );
  }, [brand]);

  const onGenerate = async () => {
    setError(null);
    setPhase("generating");
    setStepIndex(0);
    try {
      const result = await generate.mutateAsync({ url: url.trim() });
      setBrand(result.brandKit);
      setPhase("overview");
    } catch (err) {
      setPhase("enter");
      setError(
        err instanceof Error ? err.message : "Could not generate Business DNA",
      );
    }
  };

  if (phase === "generating") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center">
        <div className="w-full rounded-3xl border border-[var(--studio-border)] bg-white p-8 shadow-[0_24px_60px_rgba(30,58,95,0.12)]">
          <h1 className="text-center text-2xl font-semibold tracking-tight">
            Generating your Business DNA
          </h1>
          <p className="mt-2 text-center text-sm text-[var(--studio-muted)]">
            We&apos;re researching and analyzing your business. This usually
            takes less than a minute.
          </p>
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--studio-chip)] px-4 py-1.5 text-sm text-[var(--studio-accent)]">
              <Sparkles className="h-4 w-4" />
              {LOADING_STEPS[stepIndex]}
            </span>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-canvas)] p-6">
            <div className="h-40 animate-pulse rounded-xl bg-white/80" />
            <p className="mt-4 truncate text-center text-xs text-[var(--studio-muted)]">
              {url}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--studio-muted)]">
            <Spinner className="h-4 w-4" />
            This usually takes less than a minute.
          </div>
        </div>
      </div>
    );
  }

  if (phase === "overview" && brand) {
    const dna = brand.businessDna;
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          Your Business DNA
        </h1>
        <p className="mt-2 text-[var(--studio-muted)]">
          Unlock Posts and Videos grounded in your brand identity.
        </p>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === "overview"
                ? "bg-[var(--studio-ink)] text-white"
                : "bg-[var(--studio-chip)] text-[var(--studio-muted)]"
            }`}
          >
            Brand Overview
          </button>
          <button
            type="button"
            onClick={() => setTab("details")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === "details"
                ? "bg-[var(--studio-ink)] text-white"
                : "bg-[var(--studio-chip)] text-[var(--studio-muted)]"
            }`}
          >
            Business Details
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {tab === "overview" ? (
            <>
              <section className="rounded-2xl bg-[var(--studio-panel)] p-5">
                <h2 className="text-xl font-semibold">{brand.name}</h2>
                <p className="mt-1 text-sm text-[var(--studio-accent)]">
                  {dna?.websiteUrl ?? url}
                </p>
              </section>
              <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-2xl bg-[var(--studio-panel)] p-5">
                  <p className="text-xs uppercase tracking-wide text-[var(--studio-muted)]">
                    Logo
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    className="mt-3 h-20 w-20 rounded-xl object-contain bg-white"
                  />
                </section>
                <section className="rounded-2xl bg-[var(--studio-panel)] p-5">
                  <p className="text-xs uppercase tracking-wide text-[var(--studio-muted)]">
                    Typography
                  </p>
                  <p className="mt-3 font-serif text-4xl text-[var(--studio-accent)]">
                    Aa
                  </p>
                  <p className="mt-1 text-sm">{dna?.typography ?? "System"}</p>
                </section>
              </div>
              <section className="rounded-2xl bg-[var(--studio-panel)] p-5">
                <p className="text-xs uppercase tracking-wide text-[var(--studio-muted)]">
                  Brand colors
                </p>
                <div className="mt-3 flex flex-wrap gap-4">
                  {palette.map((hex) => (
                    <div key={hex} className="flex items-center gap-2">
                      <span
                        className="h-10 w-10 rounded-full border border-black/10"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-sm font-medium">{hex}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl bg-[var(--studio-panel)] p-5">
                <p className="text-xs uppercase tracking-wide text-[var(--studio-muted)]">
                  Brand tagline
                </p>
                <p className="mt-2 font-serif text-lg italic text-[var(--studio-accent)]">
                  {dna?.tagline ?? "—"}
                </p>
              </section>
              <div className="grid gap-4 md:grid-cols-2">
                <TagBlock title="Brand values" tags={dna?.values ?? []} />
                <TagBlock title="Brand aesthetic" tags={dna?.aesthetic ?? []} />
              </div>
              <section className="rounded-2xl bg-[var(--studio-panel)] p-5">
                <p className="text-xs uppercase tracking-wide text-[var(--studio-muted)]">
                  Tone
                </p>
                <p className="mt-2 capitalize">{brand.tone}</p>
                {dna?.toneOfVoice ? (
                  <p className="mt-2 text-sm text-[var(--studio-muted)]">
                    {dna.toneOfVoice}
                  </p>
                ) : null}
              </section>
              <TextBlock title="Image style" body={dna?.imageStyle} />
              <TextBlock title="Writing style" body={dna?.writingStyle} />
            </>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <TextBlock title="Specific industry" body={dna?.industry} />
                <TextBlock
                  title="Primary language"
                  body={dna?.primaryLanguage}
                />
              </div>
              <TextBlock title="Elevator pitch" body={dna?.elevatorPitch} />
              <TextBlock
                title="Audience and core selling points"
                body={brand.audience}
              />
            </>
          )}
        </div>

        <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-4 rounded-2xl border border-[var(--studio-border)] bg-white/90 p-4 backdrop-blur">
          <p className="text-sm text-[var(--studio-muted)]">
            Ready when you are — Posts and Videos stay separate.
          </p>
          <Button
            className="rounded-full bg-[var(--studio-ink)] px-5 text-white hover:bg-black"
            onClick={() => router.push("/studio/posts")}
          >
            Start creating
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Generate Business DNA
      </h1>
      <p className="mt-2 text-[var(--studio-muted)]">
        Paste your business website URL. We&apos;ll build Brand Overview and
        Business Details, then open Brand Studio.
      </p>
      <div className="mt-8 rounded-3xl border border-[var(--studio-border)] bg-white p-6 shadow-[0_18px_40px_rgba(30,58,95,0.08)]">
        <label className="text-sm font-medium">Website URL</label>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--studio-muted)]" />
            <Input
              className="pl-9"
              placeholder="https://yoursite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button
            disabled={!url.trim() || generate.isPending}
            onClick={onGenerate}
            className="rounded-full bg-[var(--studio-ink)] text-white hover:bg-black"
          >
            Generate
          </Button>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : null}
        <p className="mt-4 text-xs text-[var(--studio-muted)]">
          Prefer manual entry?{" "}
          <Link href="/brand-kits" className="underline">
            Brand Confirm
          </Link>
        </p>
      </div>
    </div>
  );
}

function TagBlock({ title, tags }: { title: string; tags: string[] }) {
  return (
    <section className="rounded-2xl bg-[var(--studio-panel)] p-5">
      <p className="text-xs uppercase tracking-wide text-[var(--studio-muted)]">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <span className="text-sm text-[var(--studio-muted)]">—</span>
        ) : (
          tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white px-3 py-1 text-sm text-[var(--studio-ink)]"
            >
              {tag}
            </span>
          ))
        )}
      </div>
    </section>
  );
}

function TextBlock({
  title,
  body,
}: {
  title: string;
  body: string | null | undefined;
}) {
  return (
    <section className="rounded-2xl bg-[var(--studio-panel)] p-5">
      <p className="text-xs uppercase tracking-wide text-[var(--studio-muted)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--studio-ink)]">
        {body?.trim() ? body : "—"}
      </p>
    </section>
  );
}

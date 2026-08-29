"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ImageIcon, Video } from "lucide-react";
import { GENDER_OPTIONS } from "@/components/studio/influencer-data";
import { useInfluencer } from "@/lib/hooks/use-influencers";
import { PRODUCT_PATH } from "@/lib/product-path";
import { cn } from "@/lib/utils";

type DetailTab = "images" | "videos";

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
            <TabShell
              icon={ImageIcon}
              title="No images yet"
              body="Generated influencer images will appear here."
            />
          ) : (
            <TabShell
              icon={Video}
              title="No videos yet"
              body="Generated influencer videos will appear here."
            />
          )}
        </div>
      </div>
    </div>
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

"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, Upload, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_INFLUENCER_DRAFT,
  GENDER_OPTIONS,
  buildPortraitPrompt,
  type Influencer,
  type InfluencerDraft,
  type PortraitSource,
} from "@/components/studio/influencer-data";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useCreateImageJob } from "@/lib/hooks/use-image-jobs";
import { useProducts, useUploadProductImage } from "@/lib/hooks/use-products";
import { cn } from "@/lib/utils";

export function NewInfluencerModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (influencer: Influencer) => void;
}) {
  const createImageJob = useCreateImageJob();
  const uploadImage = useUploadProductImage();
  const { data: productsData } = useProducts(open);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<InfluencerDraft>(DEFAULT_INFLUENCER_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const productSeed =
    productsData?.products?.find((product) => product.imageUrls[0])
      ?.imageUrls[0] ?? null;

  useEffect(() => {
    if (open) {
      setStep(1);
      setDraft(DEFAULT_INFLUENCER_DRAFT);
      setError(null);
      setGenerating(false);
    }
  }, [open]);

  const canContinueStep1 =
    draft.name.trim().length > 0 && draft.appearancePrompt.trim().length > 0;

  const setPortraitSource = (portraitSource: PortraitSource) => {
    setDraft((prev) => ({
      ...prev,
      portraitSource,
      portraitUrl:
        portraitSource === prev.portraitSource ? prev.portraitUrl : null,
    }));
  };

  const onUploadPortrait = async (file: File) => {
    setError(null);
    try {
      const result = await uploadImage.mutateAsync(file);
      setDraft((prev) => ({
        ...prev,
        portraitSource: "upload",
        portraitUrl: result.imageUrl,
      }));
      setStep(3);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload portrait"));
    }
  };

  const onGeneratePortrait = async () => {
    setError(null);
    const seedUrl = draft.portraitUrl || productSeed;
    if (!seedUrl) {
      setError(
        "Add a seed/reference image, or create a Product with an image first.",
      );
      return;
    }

    setGenerating(true);
    try {
      const result = await createImageJob.mutateAsync({
        prompt: buildPortraitPrompt(draft),
        referenceImageUrls: [seedUrl],
      });
      if (!result.imageJob.imageUrl) {
        throw new Error(result.imageJob.error ?? "Portrait generation failed");
      }
      setDraft((prev) => ({
        ...prev,
        portraitUrl: result.imageJob.imageUrl,
      }));
      setStep(3);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not generate portrait"));
    } finally {
      setGenerating(false);
    }
  };

  const onSave = () => {
    if (!draft.portraitUrl || !draft.name.trim()) return;
    const now = new Date().toISOString();
    onCreated({
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      gender: draft.gender,
      age: draft.age,
      ethnicity: draft.ethnicity.trim(),
      appearancePrompt: draft.appearancePrompt.trim(),
      portraitSource: draft.portraitSource,
      portraitUrl: draft.portraitUrl,
      createdAt: now,
      updatedAt: now,
    });
    onClose();
  };

  const busy = generating || createImageJob.isPending || uploadImage.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[min(92vh,820px)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <DialogTitle className="text-xl">New influencer</DialogTitle>
                <DialogDescription className="mt-1 text-sm">
                  {step === 1
                    ? "Add the basics and appearance description, then generate the portrait."
                    : step === 2
                      ? "Create or upload the base portrait for this influencer."
                      : "Review the portrait and save this influencer."}
                </DialogDescription>
              </div>
              <StepIndicator step={step} />
            </div>
          </DialogHeader>

          {step === 1 ? (
            <StepBasics
              draft={draft}
              onChange={setDraft}
              onSelectSource={setPortraitSource}
            />
          ) : null}

          {step === 2 ? (
            <StepPortrait
              draft={draft}
              productSeed={productSeed}
              busy={busy}
              onPickFile={() => fileInputRef.current?.click()}
              onGenerate={onGeneratePortrait}
            />
          ) : null}

          {step === 3 ? <StepReview draft={draft} /> : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => {
                if (step === 1) onClose();
                else setStep((current) => Math.max(1, current - 1));
              }}
            >
              {step === 1 ? "Cancel" : "Back"}
            </Button>

            {step === 1 ? (
              <Button
                className="rounded-full bg-neutral-900 text-white hover:bg-black"
                disabled={!canContinueStep1}
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
              >
                Continue
              </Button>
            ) : null}

            {step === 2 && draft.portraitSource === "upload" ? (
              <Button
                className="rounded-full bg-neutral-900 text-white hover:bg-black"
                disabled={!draft.portraitUrl || busy}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            ) : null}

            {step === 2 && draft.portraitSource === "ai" ? (
              <Button
                className="rounded-full bg-neutral-900 text-white hover:bg-black"
                disabled={busy || !(draft.portraitUrl || productSeed)}
                onClick={onGeneratePortrait}
              >
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate portrait
                  </>
                )}
              </Button>
            ) : null}

            {step === 3 ? (
              <Button
                className="rounded-full bg-neutral-900 text-white hover:bg-black"
                disabled={!draft.portraitUrl}
                onClick={onSave}
              >
                Save influencer
              </Button>
            ) : null}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (draft.portraitSource === "upload") {
              void onUploadPortrait(file);
              return;
            }
            void uploadImage
              .mutateAsync(file)
              .then((result) => {
                setDraft((prev) => ({ ...prev, portraitUrl: result.imageUrl }));
                setError(null);
              })
              .catch((err) => {
                setError(
                  getApiErrorMessage(err, "Could not upload seed image"),
                );
              });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs text-[var(--studio-muted)]">{step}/3</span>
      <div className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              "h-1 w-6 rounded-full",
              n <= step ? "bg-neutral-900" : "bg-neutral-200",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function StepBasics({
  draft,
  onChange,
  onSelectSource,
}: {
  draft: InfluencerDraft;
  onChange: (draft: InfluencerDraft) => void;
  onSelectSource: (source: PortraitSource) => void;
}) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <SourceCard
          active={draft.portraitSource === "ai"}
          icon={Wand2}
          title="Generate With AI"
          body="Describe the appearance and let AI create the base portrait."
          onClick={() => onSelectSource("ai")}
        />
        <SourceCard
          active={draft.portraitSource === "upload"}
          icon={Upload}
          title="Upload A Portrait"
          body="Use a clear portrait as the influencer's base image."
          onClick={() => onSelectSource("upload")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            value={draft.name}
            onChange={(event) =>
              onChange({ ...draft, name: event.target.value })
            }
            placeholder="Ava Lane"
            className="w-full rounded-xl border border-[var(--studio-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--studio-ink)]"
          />
        </Field>

        <Field label="Gender">
          <select
            value={draft.gender}
            onChange={(event) =>
              onChange({
                ...draft,
                gender: event.target.value as InfluencerDraft["gender"],
              })
            }
            className="w-full rounded-xl border border-[var(--studio-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--studio-ink)]"
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`Age · ${draft.age}`}>
          <div className="px-1 pt-2">
            <input
              type="range"
              min={18}
              max={60}
              value={draft.age}
              onChange={(event) =>
                onChange({ ...draft, age: Number(event.target.value) })
              }
              className="w-full accent-neutral-900"
            />
            <div className="mt-1 flex justify-between text-[11px] text-[var(--studio-muted)]">
              <span>18</span>
              <span>60</span>
            </div>
          </div>
        </Field>

        <Field label="Ethnicity">
          <input
            value={draft.ethnicity}
            onChange={(event) =>
              onChange({ ...draft, ethnicity: event.target.value })
            }
            placeholder="e.g. East Asian, Latino, mixed"
            className="w-full rounded-xl border border-[var(--studio-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--studio-ink)]"
          />
        </Field>
      </div>

      <Field label="Appearance prompt">
        <textarea
          value={draft.appearancePrompt}
          onChange={(event) =>
            onChange({ ...draft, appearancePrompt: event.target.value })
          }
          rows={4}
          placeholder="Describe face, hair, wardrobe, styling, and brand fit."
          className="w-full resize-none rounded-xl border border-[var(--studio-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--studio-ink)]"
        />
      </Field>
    </div>
  );
}

function StepPortrait({
  draft,
  productSeed,
  busy,
  onPickFile,
  onGenerate,
}: {
  draft: InfluencerDraft;
  productSeed: string | null;
  busy: boolean;
  onPickFile: () => void;
  onGenerate: () => void;
}) {
  const previewUrl = draft.portraitUrl || productSeed;

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-2xl border border-[var(--studio-border)] bg-neutral-50 p-4">
        <p className="text-sm font-semibold">{draft.name || "Influencer"}</p>
        <p className="mt-1 text-xs text-[var(--studio-muted)]">
          {draft.gender} · age {draft.age}
          {draft.ethnicity ? ` · ${draft.ethnicity}` : ""}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--studio-muted)]">
          {draft.appearancePrompt}
        </p>
      </div>

      {draft.portraitSource === "ai" ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--studio-muted)]">
            Optional: upload a seed image. If you skip this, we&apos;ll use a
            Product image when available.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPickFile}
              disabled={busy}
              className="relative flex h-28 w-28 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-[var(--studio-border)] bg-white text-[var(--studio-muted)] hover:border-[var(--studio-ink)]"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Seed"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span className="text-[11px]">Seed image</span>
                </>
              )}
            </button>
            <Button
              className="rounded-full bg-neutral-900 text-white hover:bg-black"
              disabled={busy || !previewUrl}
              onClick={onGenerate}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate portrait
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--studio-muted)]">
            Upload a clear portrait to use as this influencer&apos;s base image.
          </p>
          <button
            type="button"
            onClick={onPickFile}
            disabled={busy}
            className="relative flex h-40 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-[var(--studio-border)] bg-white text-[var(--studio-muted)] hover:border-[var(--studio-ink)]"
          >
            {draft.portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.portraitUrl}
                alt="Portrait"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <>
                <Upload className="h-6 w-6" />
                <span className="text-sm">Upload portrait</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function StepReview({ draft }: { draft: InfluencerDraft }) {
  return (
    <div className="mt-6 flex flex-col items-center text-center">
      <div className="h-56 w-44 overflow-hidden rounded-[1.5rem] border border-[var(--studio-border)] bg-neutral-100 shadow-lg">
        {draft.portraitUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={draft.portraitUrl}
            alt={draft.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <h3 className="mt-5 text-xl font-semibold">{draft.name}</h3>
      <p className="mt-1 text-sm text-[var(--studio-muted)]">
        {draft.gender} · {draft.age}
        {draft.ethnicity ? ` · ${draft.ethnicity}` : ""}
      </p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--studio-muted)]">
        {draft.appearancePrompt}
      </p>
    </div>
  );
}

function SourceCard({
  active,
  icon: Icon,
  title,
  body,
  onClick,
}: {
  active: boolean;
  icon: typeof Wand2;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-left transition",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-[var(--studio-border)] bg-white text-[var(--studio-ink)] hover:border-black/20",
      )}
    >
      <Icon className="h-5 w-5" />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p
        className={cn(
          "mt-1 text-xs leading-relaxed",
          active ? "text-white/75" : "text-[var(--studio-muted)]",
        )}
      >
        {body}
      </p>
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--studio-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

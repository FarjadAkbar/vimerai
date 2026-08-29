"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Loader2,
  Pencil,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { BlitzConfigureModal } from "@/components/studio/blitz-configure-modal";
import {
  BlitzEditOverlay,
  type BlitzEditResult,
} from "@/components/studio/blitz-edit-overlay";
import { BlitzHoverVideo } from "@/components/studio/blitz-hover-video";
import { NewMaterialsModal } from "@/components/studio/blitz-new-materials-modal";
import { BlitzTemplatesModal } from "@/components/studio/blitz-templates-modal";
import {
  BLITZ_FORMATS,
  buildBlitzQueue,
  filterBlitzTemplatesByConfig,
  type BlitzCard,
  type BlitzFormatId,
} from "@/components/studio/blitz-data";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  useBlitzAccepted,
  useBlitzConfig,
  useBlitzMaterials,
} from "@/lib/hooks/use-blitz";
import { useComposeBlitzEdit } from "@/lib/hooks/use-blitz-compose";
import { composeBlitzEditFile } from "@/lib/blitz/compose-blitz-edit";
import { useBrandKits } from "@/lib/hooks/use-brand-kits";
import { useGenerateAiImage } from "@/lib/hooks/use-ai-images";
import { useMediaAssets } from "@/lib/hooks/use-media-assets";
import {
  mapTemplateToBlitzTemplate,
  useVideoTemplates,
} from "@/lib/hooks/use-videos";
import { PRODUCT_PATH } from "@/lib/product-path";
import { cn } from "@/lib/utils";

export default function StudioBlitzPage() {
  const { data: brandsData } = useBrandKits();
  const { data: mediaData } = useMediaAssets("image");
  const brands = brandsData?.brandKits ?? [];
  const heroImage = mediaData?.assets[0];
  const brand = brands[0];

  const { config, save: saveConfig, ready: configReady } = useBlitzConfig(
    brand?.id,
  );
  const { materials, add: addMaterial, ready: materialsReady } =
    useBlitzMaterials();
  const { data: templatesData, isLoading: templatesLoading } =
    useVideoTemplates();
  const { accept } = useBlitzAccepted();
  const generateAiImage = useGenerateAiImage();
  const composeBlitzEdit = useComposeBlitzEdit();

  const templates = useMemo(() => {
    const mapped = (templatesData?.templates ?? [])
      .map(mapTemplateToBlitzTemplate)
      .filter((template): template is NonNullable<typeof template> =>
        Boolean(template),
      );
    return filterBlitzTemplatesByConfig(mapped, config);
  }, [templatesData?.templates, config]);

  const [activeFormat, setActiveFormat] =
    useState<BlitzFormatId>("green-screen");
  const [queueIndex, setQueueIndex] = useState(0);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editSaveError, setEditSaveError] = useState<string | null>(null);
  const [liveCards, setLiveCards] = useState<BlitzCard[] | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [exitDir, setExitDir] = useState<null | "left" | "right">(null);
  const dragOrigin = useRef<{ x: number; y: number; pointerId: number } | null>(
    null,
  );

  const templatesReady = !templatesLoading;
  const baseQueue = useMemo(() => {
    if (!brand || !configReady || !materialsReady || !templatesReady) return [];
    return buildBlitzQueue({
      brandName: brand.name,
      productName: brand.name,
      productImageUrl: heroImage?.url ?? null,
      materialUrls: materials
        .filter((m) => m.status === "completed" && m.imageUrl)
        .map((m) => m.imageUrl),
      templateAssets: templates,
      config,
    });
  }, [
    brand,
    heroImage,
    materials,
    templates,
    config,
    configReady,
    materialsReady,
    templatesReady,
  ]);

  const queue = (liveCards ?? baseQueue).filter(
    (entry) =>
      !rejectedIds.includes(entry.id) &&
      (config.enabledFormats[entry.formatId] ?? true),
  );

  const card =
    queue[Math.min(queueIndex, Math.max(queue.length - 1, 0))] ?? null;
  const nextCards = queue
    .slice(queueIndex + 1, queueIndex + 3)
    .concat(queue.slice(0, Math.max(0, 3 - (queue.length - queueIndex - 1))))
    .filter((entry) => entry.id !== card?.id)
    .slice(0, 2);

  const formatLabel =
    BLITZ_FORMATS.find((f) => f.id === (card?.formatId ?? activeFormat))
      ?.label ?? "Green Screen";

  useEffect(() => {
    setSlideIndex(0);
    setDrag({ x: 0, y: 0, active: false });
    setExitDir(null);
    if (card?.formatId) setActiveFormat(card.formatId);
  }, [card?.id, card?.formatId]);

  useEffect(() => {
    if (queueIndex >= queue.length) setQueueIndex(0);
  }, [queue.length, queueIndex]);

  const settleNext = () => {
    setDrag({ x: 0, y: 0, active: false });
    setExitDir(null);
  };

  const onReject = () => {
    if (!card || exitDir) return;
    setExitDir("left");
    window.setTimeout(() => {
      setRejectedIds((ids) => [...ids, card.id]);
      setEditing(false);
      settleNext();
    }, 220);
  };

  const onAccept = () => {
    if (!card || exitDir) return;
    setExitDir("right");
    window.setTimeout(() => {
      accept(card.id);
      setRejectedIds((ids) => [...ids, card.id]);
      setEditing(false);
      settleNext();
    }, 220);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragOrigin.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: 0, y: 0, active: true });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current || dragOrigin.current.pointerId !== event.pointerId)
      return;
    setDrag({
      x: event.clientX - dragOrigin.current.x,
      y: event.clientY - dragOrigin.current.y,
      active: true,
    });
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current || dragOrigin.current.pointerId !== event.pointerId)
      return;
    const dx = event.clientX - dragOrigin.current.x;
    dragOrigin.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (dx <= -88) {
      onReject();
      return;
    }
    if (dx >= 88) {
      onAccept();
      return;
    }
    setDrag({ x: 0, y: 0, active: false });
  };

  const onRegenerateText = () => {
    if (!card || !brand) return;
    const nextHook = editPrompt.trim()
      ? editPrompt.trim()
      : card.mentionBusiness
        ? `POV: ${brand.name} just changed the game for ${brand.name}`
        : card.remix.hook;
    const updated = (liveCards ?? baseQueue).map((entry) =>
      entry.id === card.id
        ? { ...entry, remix: { ...entry.remix, hook: nextHook } }
        : entry,
    );
    setLiveCards(updated);
  };

  const onDoneEditing = async (result: BlitzEditResult) => {
    if (!card || !brand) return;
    setEditSaveError(null);
    try {
      const file = await composeBlitzEditFile({
        videoUrl: result.videoUrl,
        overlayUrl: result.overlayUrl,
        hook: result.hook,
        textStyle: result.textStyle,
      });
      const saved = await composeBlitzEdit.mutateAsync({
        brandId: brand.id,
        formatId: result.formatId,
        hook: result.hook,
        sourceTemplateId: result.sourceTemplateId,
        file,
      });
      const composedUrl = saved.compose.mediaUrl ?? result.videoUrl;
      const updated = (liveCards ?? baseQueue).map((entry) =>
        entry.id === card.id
          ? {
              ...entry,
              mentionBusiness: result.mentionBusiness,
              remix: {
                ...entry.remix,
                hook: result.hook,
                videoUrl: composedUrl,
                imageUrl: composedUrl,
              },
            }
          : entry,
      );
      setLiveCards(updated);
      accept(card.id);
      setEditing(false);
    } catch (err) {
      setEditSaveError(
        getApiErrorMessage(err, "Could not save edit to your account"),
      );
    }
  };

  const onGenerateMaterials = async () => {
    if (!heroImage) {
      setError(
        "Upload a product image to Media Store first (Library → My Media Store).",
      );
      return;
    }
    setError(null);
    try {
      const result = await generateAiImage.mutateAsync({
        instructions: `Premium lifestyle background for ${brand?.name ?? "brand"} social slideshow. Soft light, clean composition, no text.`,
        referenceMediaAssetIds: [heroImage.id],
      });
      const item = result.item;
      if (!item.mediaUrl) {
        throw new Error(item.error ?? "Material generation failed");
      }
      addMaterial({
        id: item.jobId,
        imageUrl: item.mediaUrl,
        prompt: item.title ?? "",
        createdAt: item.createdAt,
        status: item.status === "failed" ? "failed" : "completed",
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not generate materials"));
    }
  };

  if (!brand) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Blitz</h1>
        <p className="mt-3 text-sm text-[var(--studio-muted)]">
          Generate Business DNA first so Blitz can remix ideas for your brand.
        </p>
        <Button
          asChild
          className="mt-6 rounded-full bg-[var(--studio-ink)] text-white hover:bg-black"
        >
          <Link href={PRODUCT_PATH.businessDna}>Business DNA</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="relative flex min-h-full flex-col overflow-visible rounded-[8px] bg-white">
      <div className="absolute right-4 top-4 z-40 flex items-center gap-2 sm:right-5 sm:top-5">
        <button
          type="button"
          onClick={() => setMaterialsOpen(true)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3.5 text-[12px] font-semibold text-zinc-700 shadow-[0_8px_22px_rgba(24,24,27,0.08)] transition hover:bg-zinc-100 hover:text-zinc-950"
        >
          <Sparkles className="size-3.5" />
          New Materials
        </button>
        <button
          type="button"
          onClick={() => setTemplatesOpen(true)}
          className="inline-flex h-8 items-center justify-center rounded-full bg-zinc-950 px-4 text-[12px] font-semibold text-white shadow-[0_8px_22px_rgba(24,24,27,0.12)] transition hover:bg-zinc-800"
        >
          Templates
        </button>
        <button
          type="button"
          onClick={() => setConfigureOpen(true)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3.5 text-[12px] font-semibold text-zinc-700 shadow-[0_8px_22px_rgba(24,24,27,0.08)] transition hover:bg-zinc-100 hover:text-zinc-950"
        >
          <Settings2 className="size-3.5" />
          Configure
        </button>
      </div>

      <div
        className="relative mx-auto flex w-full min-w-0 flex-1 items-center justify-center overflow-visible bg-white px-3 pb-8 pt-16"
        style={
          {
            "--panel-gap": "24px",
            "--preview-height": "min(64vh, 560px)",
            "--preview-width": "calc(var(--preview-height) * 0.5625)",
            "--source-preview-shell-height":
              "calc(var(--preview-height) * 0.95)",
            "--source-preview-height":
              "calc(var(--source-preview-shell-height) - 64px)",
          } as React.CSSProperties
        }
      >
        {error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : !card ? (
          <p className="text-center text-sm text-zinc-500">
            No recommendations in queue. Enable formats in Configure or
            generate New Materials.
          </p>
        ) : (
          <div className="relative mx-auto flex h-full w-full translate-y-2 items-center justify-center lg:translate-y-4">
            <div className="grid grid-cols-1 grid-rows-[auto_auto_auto] lg:grid-cols-[minmax(0,1fr)_var(--preview-width)_auto] lg:gap-x-10">
              {/* Format label — same column as phone */}
              <div className="col-start-1 row-start-1 flex justify-self-center lg:col-start-2">
                <button
                  type="button"
                  onClick={() => setTemplatesOpen(true)}
                  className="pointer-events-auto z-40 mb-6 inline-flex h-8 items-center whitespace-nowrap rounded-full bg-zinc-100 px-4 text-[13px] font-semibold text-zinc-600 ring-1 ring-inset ring-zinc-200/70 transition hover:bg-zinc-200"
                >
                  {formatLabel}
                </button>
              </div>

              {/* Main phone carousel column */}
              <div
                className="relative col-start-1 row-start-2 flex justify-self-center lg:col-start-2"
                style={{ width: "var(--preview-width)" }}
              >
                {nextCards.map((stacked, index) => {
                  const depth = index + 1;
                  const rotate = depth === 1 ? -1.5 : -3;
                  const scale = depth === 1 ? 0.95 : 0.9;
                  const opacity = depth === 1 ? 1 : 0.42;
                  return (
                    <div
                      key={stacked.id}
                      className="pointer-events-none absolute bottom-0 left-1/2 z-0 overflow-hidden rounded-[18px] shadow-[0_0_0_1px_rgba(24,24,27,0.14),0_24px_72px_rgba(24,24,27,0.38)]"
                      style={{
                        height: "var(--preview-height)",
                        aspectRatio: "9 / 16",
                        transform: `translateX(-50%) rotate(${rotate}deg) scale(${scale})`,
                        transformOrigin: "0% 100%",
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-zinc-950"
                        style={{ opacity }}
                      >
                        <StackedPreviewCard card={stacked} />
                      </div>
                    </div>
                  );
                })}

                <div
                  className={cn(
                    "relative z-30 w-auto touch-none",
                    drag.active || exitDir
                      ? "cursor-grabbing"
                      : "cursor-grab",
                  )}
                  style={{
                    transform: exitDir
                      ? `translateX(${exitDir === "left" ? "-140%" : "140%"}) rotate(${exitDir === "left" ? -18 : 18}deg)`
                      : `translate(${drag.x}px, ${drag.y * 0.2}px) rotate(${drag.x / 18}deg)`,
                    transition:
                      drag.active && !exitDir
                        ? "none"
                        : "transform 220ms ease",
                    userSelect: "none",
                  }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                >
                  <PhoneCard
                    featured
                    formatId={card.formatId}
                    imageUrl={card.remix.imageUrl}
                    videoUrl={card.remix.videoUrl}
                    hook={card.remix.hook}
                    slides={card.remix.slides}
                    slideIndex={slideIndex}
                    onSlideChange={setSlideIndex}
                    swipeHint={
                      exitDir === "left" || drag.x < -40
                        ? "reject"
                        : exitDir === "right" || drag.x > 40
                          ? "accept"
                          : null
                    }
                  />
                </div>
              </div>

              {/* Remixed From — right of the phone on desktop */}
              <div className="col-start-1 row-start-2 z-20 hidden w-fit self-end lg:col-start-3 lg:block lg:justify-self-start">
                <RemixedFromCard
                  imageUrl={card.remixedFrom.imageUrl}
                  videoUrl={card.remixedFrom.videoUrl}
                  hook={card.remixedFrom.hook}
                  likes={card.remixedFrom.likes}
                  views={card.remixedFrom.views}
                />
              </div>

              {/* Actions under phone column */}
              <div className="col-start-1 row-start-3 z-20 mt-3 flex min-h-20 items-center justify-center gap-4 justify-self-center lg:col-start-2">
                <button
                  type="button"
                  aria-label="Reject"
                  className="inline-flex size-[72px] items-center justify-center rounded-full border border-zinc-200 bg-white text-red-500 shadow-[0_0_0_1px_rgba(24,24,27,0.08),0_14px_34px_rgba(24,24,27,0.18)] transition hover:-translate-y-0.5 hover:bg-red-50"
                  onClick={onReject}
                >
                  <X className="size-8" strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-14 items-center gap-2.5 rounded-full border border-zinc-200 bg-white px-6 text-[14px] font-semibold text-zinc-700 shadow-[0_0_0_1px_rgba(24,24,27,0.08),0_14px_34px_rgba(24,24,27,0.18)] transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:text-zinc-950"
                  onClick={() => {
                    setEditPrompt("");
                    setEditing(true);
                  }}
                >
                  <Pencil className="size-4" />
                  Edit
                </button>
                <button
                  type="button"
                  aria-label="Accept"
                  className="inline-flex size-[72px] items-center justify-center rounded-full border border-zinc-200 bg-white text-emerald-500 shadow-[0_0_0_1px_rgba(24,24,27,0.08),0_14px_34px_rgba(24,24,27,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-50"
                  onClick={onAccept}
                >
                  <Check className="size-8" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {generateAiImage.isPending ? (
        <p className="shrink-0 pb-4 text-center text-sm text-zinc-500">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
          Generating materials…
        </p>
      ) : null}

      <NewMaterialsModal
        open={materialsOpen}
        onClose={() => setMaterialsOpen(false)}
        materials={materials}
        generating={generateAiImage.isPending}
        onGenerate={onGenerateMaterials}
      />
      <BlitzTemplatesModal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onPick={(formatId) => {
          setActiveFormat(formatId);
          const idx = queue.findIndex((entry) => entry.formatId === formatId);
          setQueueIndex(idx >= 0 ? idx : 0);
        }}
      />
      <BlitzConfigureModal
        open={configureOpen}
        onClose={() => setConfigureOpen(false)}
        config={config}
        onSave={(next) => {
          saveConfig(next);
          setLiveCards(null);
          setQueueIndex(0);
        }}
      />

      {editing && card ? (
        <BlitzEditOverlay
          card={
            (liveCards ?? baseQueue).find((c) => c.id === card.id) ?? card
          }
          brandName={brand.name}
          prompt={editPrompt}
          onPromptChange={setEditPrompt}
          onRegenerateText={onRegenerateText}
          onDone={onDoneEditing}
          onClose={() => {
            setEditSaveError(null);
            setEditing(false);
          }}
          saving={composeBlitzEdit.isPending}
          saveError={editSaveError}
        />
      ) : null}
    </section>
  );
}

function RemixedFromCard({
  imageUrl,
  videoUrl,
  hook,
  likes,
  views,
}: {
  imageUrl: string;
  videoUrl?: string;
  hook: string;
  likes: string;
  views: string;
}) {
  return (
    <div
      className="rounded-[12px] bg-white p-4 shadow-[0_-5px_14px_rgba(24,24,27,0.05),0_10px_24px_rgba(24,24,27,0.09)]"
      style={{ height: "var(--source-preview-shell-height)" }}
    >
      <div className="mb-3 text-[14px] font-extrabold leading-5 text-zinc-950">
        Remixed From
      </div>
      <div
        className="group relative overflow-hidden rounded-[12px] bg-zinc-900 ring-1 ring-zinc-200"
        style={{
          height: "var(--source-preview-height)",
          aspectRatio: "1080 / 1920",
        }}
      >
        {videoUrl ? (
          <BlitzHoverVideo src={videoUrl} className="size-full" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="size-full object-cover" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/48" />
        {hook ? (
          <p className="pointer-events-none absolute inset-x-3 top-10 z-10 text-[12px] font-semibold leading-snug text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
            {hook}
          </p>
        ) : null}
        <div className="pointer-events-none absolute bottom-3 right-2 z-40 flex flex-col items-center gap-2 text-white transition duration-150 group-hover:opacity-0">
          <div className="flex flex-col items-center gap-1">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-black/35 backdrop-blur-md">
              <Heart className="size-4" strokeWidth={2.4} />
            </span>
            <span className="max-w-[48px] truncate text-[10px] font-bold leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
              {likes}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-black/35 backdrop-blur-md">
              <Eye className="size-4" strokeWidth={2.4} />
            </span>
            <span className="max-w-[48px] truncate text-[10px] font-bold leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
              {views}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StackedPreviewCard({ card }: { card: BlitzCard }) {
  return (
    <div className="relative size-full overflow-hidden rounded-[18px] bg-zinc-950">
      {card.remix.videoUrl ? (
        <BlitzHoverVideo src={card.remix.videoUrl} className="size-full" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.remix.imageUrl}
          alt=""
          className="size-full object-cover"
          draggable={false}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/48" />
      <p className="pointer-events-none absolute inset-x-4 top-[42%] -translate-y-1/2 text-center text-[11px] font-medium leading-snug text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.75)]">
        {card.remix.hook}
      </p>
    </div>
  );
}

function PhoneCard({
  imageUrl,
  videoUrl,
  hook,
  slides,
  slideIndex = 0,
  onSlideChange,
  featured,
  formatId,
  swipeHint,
}: {
  imageUrl: string;
  videoUrl?: string;
  hook: string;
  slides?: Array<{ imageUrl: string; hook: string }>;
  slideIndex?: number;
  onSlideChange?: (index: number) => void;
  featured?: boolean;
  formatId?: BlitzFormatId;
  swipeHint?: "reject" | "accept" | null;
}) {
  const isSlideshow = Boolean(slides && slides.length > 1);
  const activeSlide = slides?.[slideIndex] ?? null;
  const displayImage = activeSlide?.imageUrl ?? imageUrl;
  const displayHook = activeSlide?.hook ?? hook;

  return (
    <div
      className={cn(
        "relative w-auto shrink-0 overflow-hidden rounded-[18px] bg-zinc-950 shadow-[0_0_0_1px_rgba(24,24,27,0.16),0_26px_78px_rgba(24,24,27,0.46)]",
        featured && "z-30",
      )}
      style={{
        height: "var(--preview-height)",
        aspectRatio: "1080 / 1920",
      }}
    >
      {isSlideshow ? (
        <>
          {slides!.map((slide, index) => (
            <div
              key={`${slide.imageUrl}-${index}`}
              className={cn(
                "absolute inset-0 transition-opacity duration-200",
                index === slideIndex
                  ? "opacity-100"
                  : "pointer-events-none opacity-0",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt=""
                className="size-full object-cover"
                draggable={false}
              />
            </div>
          ))}
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-40 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-950/72 text-white shadow-[0_12px_26px_rgba(24,24,27,0.2)] ring-1 ring-white/10 transition hover:bg-zinc-950"
            onClick={() =>
              onSlideChange?.(
                (slideIndex - 1 + slides!.length) % slides!.length,
              )
            }
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-40 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-950/72 text-white shadow-[0_12px_26px_rgba(24,24,27,0.2)] ring-1 ring-white/10 transition hover:bg-zinc-950"
            onClick={() =>
              onSlideChange?.((slideIndex + 1) % slides!.length)
            }
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-4 z-40 flex items-center justify-center gap-2">
            {slides!.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  "size-2.5 rounded-full transition",
                  index === slideIndex ? "bg-zinc-950" : "bg-white/68",
                )}
                onClick={() => onSlideChange?.(index)}
              />
            ))}
          </div>
        </>
      ) : videoUrl ? (
        <BlitzHoverVideo
          src={videoUrl}
          className="absolute inset-0 z-0 size-full"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
          draggable={false}
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/12 via-transparent to-black/48" />

      <div
        className="pointer-events-none absolute z-20 leading-[1.12]"
        style={{
          left: "50%",
          top: isSlideshow ? "50%" : "42.7%",
          width: isSlideshow ? "68%" : "92%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <span className="relative z-10 block w-full max-w-full whitespace-pre-wrap bg-transparent p-0 text-[13px] font-medium leading-[1.12] text-white [overflow-wrap:anywhere] [text-shadow:0_1px_2px_rgba(0,0,0,0.75)] [-webkit-text-stroke:1.2px_rgb(0,0,0)] [paint-order:stroke]">
          {displayHook}
        </span>
      </div>

      {formatId === "green-screen" && !isSlideshow ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex justify-center">
          <div className="size-20 rounded-full bg-gradient-to-br from-amber-200 via-orange-400 to-rose-500 shadow-lg ring-2 ring-white/40" />
        </div>
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 z-[90] bg-zinc-950/58 transition-opacity"
        style={{ opacity: swipeHint === "reject" ? 0.45 : 0 }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[90] bg-emerald-50/42 transition-opacity"
        style={{ opacity: swipeHint === "accept" ? 0.4 : 0 }}
      />
      <div
        className="pointer-events-none absolute left-[18%] top-[42%] z-[100] grid size-24 place-items-center rounded-full border-[8px] border-red-400 bg-red-500/18 text-red-300 transition-opacity"
        style={{ opacity: swipeHint === "reject" ? 1 : 0 }}
      >
        <X className="size-12" strokeWidth={2.4} />
      </div>
      <div
        className="pointer-events-none absolute right-[18%] top-[42%] z-[100] grid size-24 place-items-center rounded-full border-[8px] border-emerald-400 bg-emerald-500/18 text-emerald-300 transition-opacity"
        style={{ opacity: swipeHint === "accept" ? 1 : 0 }}
      >
        <Check className="size-12" strokeWidth={2.4} />
      </div>
    </div>
  );
}


"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Heart,
  Loader2,
  Pencil,
  Settings2,
  Sparkles,
  VolumeX,
  X,
} from "lucide-react";
import { BlitzConfigureModal } from "@/components/studio/blitz-configure-modal";
import { BlitzEditOverlay } from "@/components/studio/blitz-edit-overlay";
import { NewMaterialsModal } from "@/components/studio/blitz-new-materials-modal";
import { BlitzTemplatesModal } from "@/components/studio/blitz-templates-modal";
import {
  BLITZ_FORMATS,
  buildBlitzQueue,
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
import { useBrandKits } from "@/lib/hooks/use-brand-kits";
import { useCreateImageJob } from "@/lib/hooks/use-image-jobs";
import { useProducts } from "@/lib/hooks/use-products";
import { PRODUCT_PATH } from "@/lib/product-path";
import { cn } from "@/lib/utils";

export default function StudioBlitzPage() {
  const { data: brandsData } = useBrandKits();
  const { data: productsData } = useProducts();
  const { config, save: saveConfig, ready: configReady } = useBlitzConfig();
  const { materials, add: addMaterial, ready: materialsReady } =
    useBlitzMaterials();
  const { accept } = useBlitzAccepted();
  const createImageJob = useCreateImageJob();

  const brands = brandsData?.brandKits ?? [];
  const products = productsData?.products ?? [];
  const brand = brands[0];
  const product = products[0];

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
  const [liveCards, setLiveCards] = useState<BlitzCard[] | null>(null);

  const baseQueue = useMemo(() => {
    if (!brand || !configReady || !materialsReady) return [];
    return buildBlitzQueue({
      brandName: brand.name,
      productName: product?.name,
      productImageUrl: product?.imageUrls[0] ?? null,
      materialUrls: materials
        .filter((m) => m.status === "completed" && m.imageUrl)
        .map((m) => m.imageUrl),
      config,
    });
  }, [brand, product, materials, config, configReady, materialsReady]);

  const queue = (liveCards ?? baseQueue).filter(
    (card) =>
      !rejectedIds.includes(card.id) &&
      (config.enabledFormats[card.formatId] ?? true),
  );

  const filteredByFormat = queue.filter((card) => card.formatId === activeFormat);
  const activeList = filteredByFormat.length > 0 ? filteredByFormat : queue;
  const card = activeList[Math.min(queueIndex, Math.max(activeList.length - 1, 0))] ?? null;

  const formatLabel =
    BLITZ_FORMATS.find((f) => f.id === activeFormat)?.label ?? "Green Screen";

  const advance = () => {
    setQueueIndex((i) => (activeList.length <= 1 ? 0 : (i + 1) % activeList.length));
  };

  const onReject = () => {
    if (!card) return;
    setRejectedIds((ids) => [...ids, card.id]);
    setEditing(false);
    advance();
  };

  const onAccept = () => {
    if (!card) return;
    accept(card.id);
    setRejectedIds((ids) => [...ids, card.id]);
    setEditing(false);
    advance();
  };

  const onRegenerateText = () => {
    if (!card || !brand) return;
    const nextHook = editPrompt.trim()
      ? editPrompt.trim()
      : card.mentionBusiness
        ? `POV: ${brand.name} just changed the game for ${product?.name ?? "your brand"}`
        : card.remix.hook;
    const updated = (liveCards ?? baseQueue).map((entry) =>
      entry.id === card.id
        ? { ...entry, remix: { ...entry.remix, hook: nextHook } }
        : entry,
    );
    setLiveCards(updated);
  };

  const onGenerateMaterials = async () => {
    if (!product?.imageUrls[0]) {
      setError("Add a Product with an image first (Make a Post or Products).");
      return;
    }
    setError(null);
    try {
      const result = await createImageJob.mutateAsync({
        prompt: `Premium lifestyle background for ${brand?.name ?? "brand"} social slideshow. Soft light, clean composition, no text.`,
        referenceImageUrls: [product.imageUrls[0]],
      });
      addMaterial({
        id: result.imageJob.id,
        imageUrl: result.imageJob.imageUrl ?? "",
        prompt: result.imageJob.prompt,
        createdAt: result.imageJob.createdAt,
        status: result.imageJob.status,
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
    <div className="mx-auto flex min-h-full w-full flex-col">
      <header className="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 bg-[var(--studio-canvas)] pb-3">
        <h1 className="text-2xl font-semibold tracking-tight">Blitz</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMaterialsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--studio-border)] bg-white px-3.5 py-2 text-sm hover:border-black/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            New Materials
          </button>
          <button
            type="button"
            onClick={() => setTemplatesOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-2 text-sm text-white"
          >
            Templates
          </button>
          <button
            type="button"
            onClick={() => setConfigureOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--studio-border)] bg-white px-3.5 py-2 text-sm hover:border-black/20"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Configure
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-2 py-6">
          {error ? (
            <p className="text-center text-sm text-red-600">{error}</p>
          ) : !card ? (
            <p className="text-center text-sm text-[var(--studio-muted)]">
              No recommendations in queue. Enable formats in Configure or
              generate New Materials.
            </p>
          ) : (
            <div className="flex w-full max-w-2xl flex-col items-center">
              <button
                type="button"
                onClick={() => setTemplatesOpen(true)}
                className="mb-5 shrink-0 rounded-full border border-[var(--studio-border)] bg-white px-4 py-1.5 text-sm font-medium shadow-sm"
              >
                {formatLabel}
              </button>

              <div className="flex items-end justify-center gap-5 sm:gap-8">
                <RemixedFromCard
                  imageUrl={card.remixedFrom.imageUrl}
                  hook={card.remixedFrom.hook}
                  likes={card.remixedFrom.likes}
                  views={card.remixedFrom.views}
                />

                <div className="flex shrink-0 flex-col items-center">
                  <PhoneCard
                    featured
                    formatId={card.formatId}
                    imageUrl={card.remix.imageUrl}
                    hook={card.remix.hook}
                    showMute
                  />

                  <div className="relative z-10 mt-6 flex shrink-0 items-center gap-3 pb-2 sm:gap-4">
                    <button
                      type="button"
                      aria-label="Reject"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600 sm:h-14 sm:w-14"
                      onClick={onReject}
                    >
                      <X className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button
                      type="button"
                      className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium shadow-lg ring-1 ring-black/5 transition hover:bg-neutral-50 sm:h-12 sm:px-5"
                      onClick={() => {
                        setEditPrompt("");
                        setEditing(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label="Accept"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 sm:h-14 sm:w-14"
                      onClick={onAccept}
                    >
                      <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {createImageJob.isPending ? (
        <p className="shrink-0 pt-2 text-center text-sm text-[var(--studio-muted)]">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
          Generating materials…
        </p>
      ) : null}

      <NewMaterialsModal
        open={materialsOpen}
        onClose={() => setMaterialsOpen(false)}
        materials={materials}
        generating={createImageJob.isPending}
        onGenerate={onGenerateMaterials}
      />
      <BlitzTemplatesModal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onPick={(formatId) => {
          setActiveFormat(formatId);
          setQueueIndex(0);
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
          mentionBusiness={
            ((liveCards ?? baseQueue).find((c) => c.id === card.id) ?? card)
              .mentionBusiness
          }
          onMentionChange={(value) => {
            const updated = (liveCards ?? baseQueue).map((entry) =>
              entry.id === card.id
                ? { ...entry, mentionBusiness: value }
                : entry,
            );
            setLiveCards(updated);
          }}
          onRegenerateText={onRegenerateText}
          onDone={() => setEditing(false)}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </div>
  );
}

function RemixedFromCard({
  imageUrl,
  hook,
  likes,
  views,
}: {
  imageUrl: string;
  hook: string;
  likes: string;
  views: string;
}) {
  return (
    <div className="hidden shrink-0 rounded-[1.75rem] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 sm:block">
      <p className="mb-2 text-sm font-semibold text-[var(--studio-ink)]">
        Remixed From
      </p>
      <PhoneCard
        muted
        imageUrl={imageUrl}
        hook={hook}
        likes={likes}
        views={views}
      />
    </div>
  );
}

function PhoneCard({
  imageUrl,
  hook,
  likes,
  views,
  muted,
  featured,
  showMute,
  formatId,
}: {
  imageUrl: string;
  hook: string;
  likes?: string;
  views?: string;
  muted?: boolean;
  featured?: boolean;
  showMute?: boolean;
  formatId?: BlitzFormatId;
}) {
  const isGradient = imageUrl.startsWith("gradient:");
  const gradient = isGradient ? imageUrl.replace("gradient:", "") : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] bg-black text-white",
        featured
          ? "h-[22rem] w-[14rem] shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          : "h-[18rem] w-[11rem]",
        muted && "opacity-95",
      )}
    >
      {isGradient ? (
        <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50" />

      {showMute ? (
        <div className="absolute left-3 top-3 z-[1] rounded-full bg-black/40 p-1.5 backdrop-blur-sm">
          <VolumeX className="h-4 w-4" />
        </div>
      ) : null}

      <div className="relative z-[1] flex h-full flex-col p-4">
        <p
          className={cn(
            "mt-10 font-bold leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]",
            featured ? "text-lg" : "text-sm",
          )}
        >
          {hook}
        </p>

        {featured && formatId === "green-screen" ? (
          <div className="mt-auto flex justify-center pb-3">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-200 via-orange-400 to-rose-500 shadow-lg ring-2 ring-white/40" />
          </div>
        ) : featured ? (
          <div className="mt-auto pb-4" />
        ) : (
          <div className="mt-auto space-y-2 pb-2">
            <div className="ml-auto flex flex-col items-center gap-3 text-[10px]">
              <span className="flex flex-col items-center gap-0.5">
                <Heart className="h-4 w-4 fill-white" />
                {likes}
              </span>
              <span className="opacity-80">{views}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

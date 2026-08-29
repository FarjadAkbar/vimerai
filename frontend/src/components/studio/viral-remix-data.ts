/** Viral Remix template metadata (generation lives on the backend). */

export type ViralRemixTemplateMeta = {
  id: string;
  /** Stored on Video.formatId (`vr-*`). */
  formatId: string;
  /** CuratedFormatCatalog id used when creating a video job. */
  remixFormatId: string;
  label: string;
  durationLabel: string;
};

export const VIRAL_REMIX_TEMPLATE_META: readonly ViralRemixTemplateMeta[] = [
  {
    id: "vr-cold-open",
    formatId: "vr-cold-open",
    remixFormatId: "hook-reveal",
    label: "Cold-open hook",
    durationLabel: "6s",
  },
  {
    id: "vr-pattern-interrupt",
    formatId: "vr-pattern-interrupt",
    remixFormatId: "hook-reveal",
    label: "Pattern interrupt",
    durationLabel: "8s",
  },
  {
    id: "vr-hands-on",
    formatId: "vr-hands-on",
    remixFormatId: "demo-in-use",
    label: "Hands-on demo",
    durationLabel: "9s",
  },
  {
    id: "vr-texture",
    formatId: "vr-texture",
    remixFormatId: "demo-in-use",
    label: "Texture close-up",
    durationLabel: "7s",
  },
  {
    id: "vr-pain-fix",
    formatId: "vr-pain-fix",
    remixFormatId: "problem-solution",
    label: "Pain → fix",
    durationLabel: "10s",
  },
  {
    id: "vr-scroll-stop",
    formatId: "vr-scroll-stop",
    remixFormatId: "problem-solution",
    label: "Scroll-stop pain",
    durationLabel: "8s",
  },
  {
    id: "vr-before-after",
    formatId: "vr-before-after",
    remixFormatId: "before-after",
    label: "Before → after",
    durationLabel: "9s",
  },
  {
    id: "vr-result-reveal",
    formatId: "vr-result-reveal",
    remixFormatId: "before-after",
    label: "Result reveal",
    durationLabel: "7s",
  },
  {
    id: "vr-urgency",
    formatId: "vr-urgency",
    remixFormatId: "hook-reveal",
    label: "Urgency CTA",
    durationLabel: "6s",
  },
  {
    id: "vr-unbox",
    formatId: "vr-unbox",
    remixFormatId: "demo-in-use",
    label: "Unbox energy",
    durationLabel: "10s",
  },
  {
    id: "vr-lifestyle-flip",
    formatId: "vr-lifestyle-flip",
    remixFormatId: "problem-solution",
    label: "Lifestyle flip",
    durationLabel: "8s",
  },
  {
    id: "vr-glow-up",
    formatId: "vr-glow-up",
    remixFormatId: "before-after",
    label: "Glow-up cut",
    durationLabel: "9s",
  },
] as const;

export type ViralRemixTemplate = ViralRemixTemplateMeta & {
  videoId: string;
  videoUrl: string;
  status: "pending" | "processing" | "completed" | "failed";
};

export function mapTemplateToViralRemixTemplate(template: {
  id: string;
  slug: string;
  remixFormatId: string | null;
  label: string;
  durationLabel: string | null;
  videoUrl: string | null;
  status: ViralRemixTemplate["status"];
}): ViralRemixTemplate | null {
  if (!template.slug.startsWith("vr-")) return null;
  const meta = VIRAL_REMIX_TEMPLATE_META.find(
    (entry) => entry.formatId === template.slug,
  );
  if (!meta) return null;
  return {
    ...meta,
    label: template.label || meta.label,
    durationLabel: template.durationLabel || meta.durationLabel,
    remixFormatId: template.remixFormatId || meta.remixFormatId,
    videoId: template.id,
    videoUrl: template.videoUrl ?? "",
    status: template.status,
  };
}

/** @deprecated Use mapTemplateToViralRemixTemplate */
export const mapVideoToViralRemixTemplate = mapTemplateToViralRemixTemplate;

export const REMIX_STEPS = [
  {
    title: "Upload reference assets",
    body: "Choose a reference video and optional Product or Person images.",
  },
  {
    title: "Click Generate",
    body: "AI will handle the transformation and remix pacing.",
  },
  {
    title: "View the remix video",
    body: "Your vertical remix video will be ready in a few minutes.",
  },
] as const;

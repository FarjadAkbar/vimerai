export type BlitzFormatId =
  | "slideshow"
  | "wall-of-text"
  | "hook-demo"
  | "green-screen";

export type MentionFrequency =
  | "never"
  | "rarely"
  | "sometimes"
  | "often"
  | "always";

export interface BlitzFormat {
  id: BlitzFormatId;
  label: string;
  description: string;
  gradient: string;
  sampleHook: string;
}

export interface BlitzConfig {
  mentionFrequency: MentionFrequency;
  showInfluencerMaterials: boolean;
  enabledFormats: Record<BlitzFormatId, boolean>;
}

export interface BlitzMaterial {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  status: "completed" | "failed" | "processing";
}

export interface BlitzCard {
  id: string;
  formatId: BlitzFormatId;
  remixedFrom: {
    imageUrl: string;
    hook: string;
    likes: string;
    views: string;
  };
  remix: {
    imageUrl: string;
    hook: string;
    backgroundLabel: string;
  };
  mentionBusiness: boolean;
}

export const BLITZ_FORMATS: BlitzFormat[] = [
  {
    id: "slideshow",
    label: "Slideshow",
    description: "Multi-image carousel with editable captions",
    gradient: "from-slate-700 via-slate-500 to-amber-200",
    sampleHook: "Things I wish I knew before writing papers",
  },
  {
    id: "wall-of-text",
    label: "Wall of Text",
    description: "Background video with a text-led hook",
    gradient: "from-zinc-900 via-neutral-700 to-stone-400",
    sampleHook:
      "Financial literacy starts with one simple habit most people skip...",
  },
  {
    id: "hook-demo",
    label: "Hook + Demo",
    description: "Hook clip stitched with demo footage",
    gradient: "from-rose-800 via-orange-600 to-yellow-300",
    sampleHook: "I'm actually crying... How am I just now finding this??",
  },
  {
    id: "green-screen",
    label: "Green Screen",
    description: "Trending video over a chosen background",
    gradient: "from-emerald-800 via-teal-600 to-sky-300",
    sampleHook:
      "POV: You thought starting a business would give you more freedom",
  },
];

export const DEFAULT_BLITZ_CONFIG: BlitzConfig = {
  mentionFrequency: "sometimes",
  showInfluencerMaterials: false,
  enabledFormats: {
    slideshow: true,
    "wall-of-text": true,
    "hook-demo": true,
    "green-screen": true,
  },
};

export const MENTION_OPTIONS: Array<{
  value: MentionFrequency;
  label: string;
}> = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often" },
  { value: "always", label: "Always" },
];

const SOURCE_HOOKS = [
  "POV: You thought starting a business would give you more freedom",
  "Nobody talks about this part of building a brand",
  "I stopped doing this one thing and everything changed",
  "Wait until you see what this actually costs",
];

function shouldMention(frequency: MentionFrequency, index: number): boolean {
  switch (frequency) {
    case "never":
      return false;
    case "rarely":
      return index % 5 === 0;
    case "sometimes":
      return index % 2 === 0;
    case "often":
      return index % 3 !== 2;
    case "always":
      return true;
  }
}

function brandHook(
  brandName: string,
  productName: string | undefined,
  mention: boolean,
  formatId: BlitzFormatId,
  index: number,
): string {
  if (!mention) {
    return SOURCE_HOOKS[index % SOURCE_HOOKS.length];
  }
  const product = productName ?? "this";
  const hooks: Record<BlitzFormatId, string[]> = {
    "green-screen": [
      `POV: You thought keeping things showroom-clean was impossible until you found ${brandName}`,
      `POV: ${brandName} just made ${product} look unfair`,
    ],
    slideshow: [
      `3 reasons ${brandName} changed how I use ${product}`,
      `Things I wish I knew before trying ${brandName}`,
    ],
    "wall-of-text": [
      `Most people overlook ${product} until ${brandName} makes it obvious.`,
      `Here's why ${brandName} keeps showing up in my feed.`,
    ],
    "hook-demo": [
      `I'm actually crying... How am I just now finding ${brandName}??`,
      `Watch what ${product} does in 10 seconds with ${brandName}`,
    ],
  };
  const list = hooks[formatId];
  return list[index % list.length];
}

export function buildBlitzQueue(input: {
  brandName: string;
  productName?: string;
  productImageUrl?: string | null;
  materialUrls: string[];
  config: BlitzConfig;
}): BlitzCard[] {
  const formats = BLITZ_FORMATS.filter((f) => input.config.enabledFormats[f.id]);
  if (formats.length === 0) return [];

  const cards: BlitzCard[] = [];
  for (let i = 0; i < 8; i++) {
    const format = formats[i % formats.length];
    const mention = shouldMention(input.config.mentionFrequency, i);
    const materialUrl =
      input.materialUrls[i % Math.max(input.materialUrls.length, 1)] ?? null;
    const productUrl = input.productImageUrl ?? null;
    const remixBg =
      materialUrl ??
      productUrl ??
      `gradient:${format.gradient}`;

    cards.push({
      id: `blitz-${format.id}-${i}`,
      formatId: format.id,
      remixedFrom: {
        imageUrl: `gradient:${format.gradient}`,
        hook: format.sampleHook || SOURCE_HOOKS[i % SOURCE_HOOKS.length],
        likes: `${(40 + i * 7).toFixed(1)}K`,
        views: `${(200 + i * 33).toFixed(0)}K`,
      },
      remix: {
        imageUrl: remixBg,
        hook: brandHook(
          input.brandName,
          input.productName,
          mention,
          format.id,
          i,
        ),
        backgroundLabel: materialUrl
          ? "Material pool"
          : productUrl
            ? "Product"
            : "Template",
      },
      mentionBusiness: mention,
    });
  }
  return cards;
}

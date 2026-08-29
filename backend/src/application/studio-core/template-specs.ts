import {
  BlitzContentType,
  TemplateType,
} from '@/domain/template.entity';

export const BLITZ_TEMPLATE_SPECS = [
  {
    slug: 'slideshow',
    contentType: BlitzContentType.SLIDESHOW,
    label: 'Slideshow',
    prompt:
      'Vertical 9:16 social slideshow style B-roll, soft product lifestyle flat lay, clean daylight, premium Instagram carousel energy, no text overlay, no watermark',
  },
  {
    slug: 'wall-of-text',
    contentType: BlitzContentType.WALL_OF_TEXT,
    label: 'Wall of Text',
    prompt:
      'Vertical 9:16 TikTok background clip, lifestyle selfie energy, soft daylight, cinematic shallow depth of field, clean modern aesthetic, no text overlay, no watermark',
  },
  {
    slug: 'hook-demo',
    contentType: BlitzContentType.HOOK_DEMO,
    label: 'Hook + Demo',
    prompt:
      'Vertical 9:16 product demo clip on a clean desk with phone and laptop, soft studio light, premium ecommerce vibe, no readable brand names, no text overlay, no watermark',
  },
  {
    slug: 'green-screen',
    contentType: BlitzContentType.GREEN_SCREEN,
    label: 'Green Screen',
    prompt:
      'Vertical 9:16 first-person desk POV clip, open laptop, coffee mug, notebook, soft window light, creator workspace aesthetic, no text overlay, no watermark',
  },
] as const;

export const VIRAL_REMIX_TEMPLATE_SPECS = [
  {
    slug: 'vr-cold-open',
    remixFormatId: 'hook-reveal',
    label: 'Cold-open hook',
    durationLabel: '6s',
    prompt:
      'Vertical 9:16 ultra-short 6 second paid social ad cold open: abrupt curiosity beat, fast cut product tease, high energy, no text overlay, no watermark, commercial UGC feel',
  },
  {
    slug: 'vr-pattern-interrupt',
    remixFormatId: 'hook-reveal',
    label: 'Pattern interrupt',
    durationLabel: '8s',
    prompt:
      'Vertical 9:16 8 second pattern-interrupt ad: unexpected visual punch then product reveal, snappy pacing, premium DTC energy, no text overlay, no watermark',
  },
  {
    slug: 'vr-hands-on',
    remixFormatId: 'demo-in-use',
    label: 'Hands-on demo',
    durationLabel: '9s',
    prompt:
      'Vertical 9:16 9 second hands-on product demo ad: close-up hands using product, satisfying motion, clean desk, soft studio light, no text overlay, no watermark',
  },
  {
    slug: 'vr-texture',
    remixFormatId: 'demo-in-use',
    label: 'Texture close-up',
    durationLabel: '7s',
    prompt:
      'Vertical 9:16 7 second texture macro ad: extreme close-up material and finish of a lifestyle product, shallow depth of field, luxury ecommerce vibe, no text overlay, no watermark',
  },
  {
    slug: 'vr-pain-fix',
    remixFormatId: 'problem-solution',
    label: 'Pain → fix',
    durationLabel: '10s',
    prompt:
      'Vertical 9:16 10 second problem-solution ad: stressed everyday moment then calm product fix, clear contrast, social ad pacing, no text overlay, no watermark',
  },
  {
    slug: 'vr-scroll-stop',
    remixFormatId: 'problem-solution',
    label: 'Scroll-stop pain',
    durationLabel: '8s',
    prompt:
      'Vertical 9:16 8 second scroll-stopping pain ad: relatable frustration then quick relief with product, punchy cuts, no text overlay, no watermark',
  },
  {
    slug: 'vr-before-after',
    remixFormatId: 'before-after',
    label: 'Before → after',
    durationLabel: '9s',
    prompt:
      'Vertical 9:16 9 second before-and-after ad: clear transformation beat, product as the cause, bright result energy, no text overlay, no watermark',
  },
  {
    slug: 'vr-result-reveal',
    remixFormatId: 'before-after',
    label: 'Result reveal',
    durationLabel: '7s',
    prompt:
      'Vertical 9:16 7 second result-reveal ad: quick setup then glowing outcome with product hero, crisp commercial lighting, no text overlay, no watermark',
  },
  {
    slug: 'vr-urgency',
    remixFormatId: 'hook-reveal',
    label: 'Urgency CTA',
    durationLabel: '6s',
    prompt:
      'Vertical 9:16 6 second urgency CTA ad: fast hook, product flash, decisive end frame energy, high retention pacing, no text overlay, no watermark',
  },
  {
    slug: 'vr-unbox',
    remixFormatId: 'demo-in-use',
    label: 'Unbox energy',
    durationLabel: '10s',
    prompt:
      'Vertical 9:16 10 second unboxing-style ad: package open, product lift, satisfying reveal, soft daylight, ecommerce UGC energy, no text overlay, no watermark',
  },
  {
    slug: 'vr-lifestyle-flip',
    remixFormatId: 'problem-solution',
    label: 'Lifestyle flip',
    durationLabel: '8s',
    prompt:
      'Vertical 9:16 8 second lifestyle flip ad: dull routine then elevated moment with product, warm cinematic light, no text overlay, no watermark',
  },
  {
    slug: 'vr-glow-up',
    remixFormatId: 'before-after',
    label: 'Glow-up cut',
    durationLabel: '9s',
    prompt:
      'Vertical 9:16 9 second glow-up cut ad: quick dull-to-polished transformation featuring product, premium social ad finish, no text overlay, no watermark',
  },
] as const;

const BLITZ_SLUGS = new Set(BLITZ_TEMPLATE_SPECS.map((spec) => spec.slug));

export function isBlitzTemplateSlug(slug: string | null | undefined): boolean {
  return Boolean(slug && BLITZ_SLUGS.has(slug as (typeof BLITZ_TEMPLATE_SPECS)[number]['slug']));
}

export function isViralRemixTemplateSlug(
  slug: string | null | undefined,
): boolean {
  return Boolean(slug?.startsWith('vr-'));
}

/** @deprecated Use isBlitzTemplateSlug */
export function isBlitzTemplateFormatId(formatId: string | null | undefined) {
  return isBlitzTemplateSlug(formatId);
}

/** @deprecated Use isViralRemixTemplateSlug */
export function isViralRemixTemplateFormatId(
  formatId: string | null | undefined,
) {
  return isViralRemixTemplateSlug(formatId);
}

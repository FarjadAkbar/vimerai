import { Injectable } from '@nestjs/common';
import type { IFormatCatalog } from '@/core/ports/format.catalog';
import type { Format, FormatListMode } from '@/types/format/format';

const CURATED_FORMATS: readonly Format[] = [
  {
    id: 'listicle-hook',
    label: 'Listicle hook',
    description: 'Numbered essentials with a clear product payoff.',
    modality: 'post',
    promptStructure:
      'Listicle Instagram feed creative: bold numbered hook (e.g. "5 essentials"), short benefit lines, product recognizably featured, strong CTA energy. Not a packshot.',
  },
  {
    id: 'problem-solution',
    label: 'Problem-solution',
    description: 'Pain → relief with the Product as the fix.',
    modality: 'both',
    promptStructure:
      'Problem-solution Instagram creative: show the everyday frustration, then the Product as the clear fix. Lifestyle scene, scroll-stopping contrast, benefit-led.',
  },
  {
    id: 'meme-cta',
    label: 'Meme CTA',
    description: 'Familiar meme structure with a direct call to action.',
    modality: 'post',
    promptStructure:
      'Meme-style Instagram feed still with relatable humor and a clear CTA. Keep brand colors and Product visible; witty but on-brand, not cringe.',
  },
  {
    id: 'before-after',
    label: 'Before & after',
    description: 'Side-by-side transformation that sells the result.',
    modality: 'both',
    promptStructure:
      'Before-and-after Instagram creative: split or sequential transformation showing Product results. Clean composition, product recognizably present, premium social feel.',
  },
  {
    id: 'ugc-testimonial',
    label: 'UGC testimonial',
    description: 'Native-feeling social proof frame for the Product.',
    modality: 'post',
    promptStructure:
      'UGC-style Instagram testimonial still: authentic phone-photo energy, Product in hand or in use, short praise vibe without readable fake captions as the focus.',
  },
  {
    id: 'hook-reveal',
    label: 'Hook reveal',
    description: 'Curiosity hook then Product reveal — video-first pattern.',
    modality: 'video',
    promptStructure:
      'Short vertical video structure: cold-open curiosity hook, mid reveal of the Product, closing CTA beat. High retention pacing for Reels/TikTok.',
  },
  {
    id: 'demo-in-use',
    label: 'Demo in use',
    description: 'Hands-on Product demo for short video.',
    modality: 'video',
    promptStructure:
      'Hands-on Product demo for short vertical video: show use, texture/result, end on brand mark and soft CTA. Keep Product hero the whole time.',
  },
];

@Injectable()
export class CuratedFormatCatalog implements IFormatCatalog {
  listByModality(mode: FormatListMode): Format[] {
    return CURATED_FORMATS.filter(
      (format) => format.modality === mode || format.modality === 'both',
    ).map((format) => ({ ...format }));
  }

  getById(id: string): Format | null {
    const format = CURATED_FORMATS.find((entry) => entry.id === id);
    return format ? { ...format } : null;
  }
}

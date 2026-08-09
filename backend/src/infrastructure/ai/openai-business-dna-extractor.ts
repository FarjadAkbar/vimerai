import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { IBusinessDnaExtractor } from '@/core/ports/business-dna-extractor';
import type {
  BusinessDnaExtraction,
  HomepageScrapeResult,
} from '@/types/brand/business-dna';
import { emptyBusinessDna } from '@/types/brand/business-dna';
import type { Tone } from '@/types/generation/enums';

const ALLOWED_TONES: readonly Tone[] = [
  'luxury',
  'professional',
  'playful',
  'bold',
  'friendly',
];

const PROSE_MAX = 1200;

/** Exported for unit tests — system instructions for Business DNA structuring. */
export const BUSINESS_DNA_SYSTEM_PROMPT = [
  'You extract Business DNA from a scraped business homepage for an ecommerce creative studio.',
  'Return ONLY valid JSON matching the schema. No markdown.',
  'tone must be one of: luxury, professional, playful, bold, friendly.',
  'primaryColor and colorPalette entries must be hex like #RRGGBB.',
  'Invent nothing that contradicts the page; infer reasonably from the copy, product category, and cues in the text.',
  'Keep short fields (name, tagline, values, aesthetic, industry) concise.',
  'imageStyle and writingStyle are REQUIRED non-empty strings — never null, never a single adjective.',
  'imageStyle: write 2–4 sentences of concrete photography / visual direction for ads and social creatives.',
  'Ground it in the brand and product category: lighting, setting, what to feature, materials/finish cues, and what to avoid.',
  'Example shape (adapt to THIS brand, do not copy): "Images should feature high-contrast, sharp photography with a focus on before-and-after results. Use a modern studio aesthetic with clean pedestals for product shots, plus lifestyle shots that show the product in real use."',
  'writingStyle: write 2–4 sentences of concrete copy voice for captions and on-image text.',
  'Cover sentence shape, vocabulary, do\'s (and brief don\'ts if clear), and how brand promises should sound — not only a tone label like "professional".',
  'Example shape (adapt to THIS brand, do not copy): "The writing style should be authoritative yet accessible, focusing on the core promise. Use instructional and encouraging language that simplifies the process and emphasizes ease of use and visible results."',
].join(' ');

/** Exported for unit tests — JSON schema hints sent to the model. */
export const BUSINESS_DNA_OUTPUT_SCHEMA = {
  name: 'string',
  primaryColor: '#hex',
  secondaryColor: '#hex|null',
  tone: 'luxury|professional|playful|bold|friendly',
  audience: 'string',
  typography: 'string|null',
  colorPalette: ['#hex'],
  tagline: 'string|null',
  values: ['string'],
  aesthetic: ['string'],
  toneOfVoice: 'string|null',
  imageStyle:
    'required string — 2-4 sentences of photography/visual direction grounded in the homepage',
  writingStyle:
    'required string — 2-4 sentences of copy voice, sentence shape, and dos grounded in the homepage',
  industry: 'string|null',
  primaryLanguage: 'string|null',
  elevatorPitch: 'string|null',
} as const;

interface ExtractionJson {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string | null;
  tone?: string;
  audience?: string;
  typography?: string | null;
  colorPalette?: string[];
  tagline?: string | null;
  values?: string[];
  aesthetic?: string[];
  toneOfVoice?: string | null;
  imageStyle?: string | null;
  writingStyle?: string | null;
  industry?: string | null;
  primaryLanguage?: string | null;
  elevatorPitch?: string | null;
}

@Injectable()
export class OpenAiBusinessDnaExtractor implements IBusinessDnaExtractor {
  private readonly logger = new Logger(OpenAiBusinessDnaExtractor.name);

  constructor(private readonly configService: ConfigService) {}

  async extract(scrape: HomepageScrapeResult): Promise<BusinessDnaExtraction> {
    const apiKey = this.configService.get<string>('openai.apiKey');
    const baseUrl = this.configService.get<string>('openai.baseUrl');
    const model = this.configService.get<string>('openai.model');

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OPENAI_API_KEY is not configured',
      );
    }

    const user = JSON.stringify({
      url: scrape.url,
      title: scrape.title,
      description: scrape.description,
      textContent: scrape.textContent.slice(0, 8000),
      schema: BUSINESS_DNA_OUTPUT_SCHEMA,
    });

    try {
      const response = await axios.post<{
        choices?: Array<{ message?: { content?: string } }>;
      }>(
        `${baseUrl}/chat/completions`,
        {
          model,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: BUSINESS_DNA_SYSTEM_PROMPT },
            { role: 'user', content: user },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 90_000,
        },
      );

      const text = response.data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new ServiceUnavailableException(
          'OpenAI returned an empty Business DNA response',
        );
      }

      return mapExtraction(scrape, JSON.parse(text) as ExtractionJson);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error(
        'OpenAI Business DNA extraction failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(
        error instanceof Error
          ? error.message
          : 'Business DNA extraction failed',
      );
    }
  }
}

export function mapExtraction(
  scrape: HomepageScrapeResult,
  raw: ExtractionJson,
): BusinessDnaExtraction {
  const fallbackName =
    scrape.title?.replace(/\s*[|\-–].*$/, '').trim() || 'Untitled Brand';
  const name = (raw.name?.trim() || fallbackName).slice(0, 120);
  const primaryColor = normalizeHex(raw.primaryColor) ?? '#111111';
  const secondaryColor = normalizeHex(raw.secondaryColor ?? undefined);
  const tone = normalizeTone(raw.tone);
  const audience = (raw.audience?.trim() || scrape.description || '').slice(
    0,
    2000,
  );
  const palette = (raw.colorPalette ?? [])
    .map((c) => normalizeHex(c))
    .filter((c): c is string => Boolean(c))
    .filter((c) => c !== primaryColor && c !== secondaryColor)
    .slice(0, 6);

  const businessDna = emptyBusinessDna(scrape.url);
  businessDna.typography = raw.typography?.trim() || null;
  businessDna.colorPalette = palette;
  businessDna.tagline = raw.tagline?.trim() || scrape.description || null;
  businessDna.values = cleanStringList(raw.values);
  businessDna.aesthetic = cleanStringList(raw.aesthetic);
  businessDna.toneOfVoice = raw.toneOfVoice?.trim() || null;
  businessDna.imageStyle = clipProse(
    raw.imageStyle?.trim() || groundedImageStyleFallback(scrape),
  );
  businessDna.writingStyle = clipProse(
    raw.writingStyle?.trim() || groundedWritingStyleFallback(scrape),
  );
  businessDna.industry = raw.industry?.trim() || null;
  businessDna.primaryLanguage = raw.primaryLanguage?.trim() || 'English';
  businessDna.elevatorPitch =
    raw.elevatorPitch?.trim() || scrape.description || null;

  return {
    name,
    logoUrl: scrape.logoCandidateUrl,
    primaryColor,
    secondaryColor,
    tone,
    audience,
    businessDna,
  };
}

export function groundedImageStyleFallback(
  scrape: HomepageScrapeResult,
): string {
  const subject =
    scrape.title?.replace(/\s*[|\-–].*$/, '').trim() || "the brand's products";
  const cue =
    scrape.description?.trim() ||
    scrape.textContent.replace(/\s+/g, ' ').trim().slice(0, 160);
  const cueClause = cue ? ` that reflects "${cue.slice(0, 140)}"` : '';
  return (
    `Feature sharp, high-quality photography that clearly shows ${subject} in real use` +
    `${cueClause}. ` +
    `Prefer category-true lighting, materials, and settings over generic stock. ` +
    `Include close product detail plus lifestyle context that makes the benefit obvious at a glance.`
  );
}

export function groundedWritingStyleFallback(
  scrape: HomepageScrapeResult,
): string {
  const cue =
    scrape.description?.trim() ||
    scrape.title?.trim() ||
    'the brand promise on the homepage';
  return (
    `Write in a clear, confident voice that echoes the homepage message (${cue.slice(0, 140)}). ` +
    `Use short, concrete sentences that explain benefits and next steps without empty hype. ` +
    `Stay instructional and benefit-led so captions and on-image copy feel usable for social creatives.`
  );
}

function clipProse(value: string): string {
  return value.slice(0, PROSE_MAX);
}

function normalizeTone(value: string | undefined): Tone {
  const lower = value?.toLowerCase().trim();
  if (lower && (ALLOWED_TONES as readonly string[]).includes(lower)) {
    return lower as Tone;
  }
  return 'professional';
}

function normalizeHex(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const match = trimmed.match(/^#?([0-9a-fA-F]{6})$/);
  if (!match) return null;
  return `#${match[1].toUpperCase()}`;
}

function cleanStringList(values: string[] | undefined): string[] {
  if (!values) return [];
  return values
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 8);
}

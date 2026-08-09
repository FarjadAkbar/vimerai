import type { BusinessDna } from '@/types/brand/business-dna';
import type { Tone } from '@/types/generation/enums';

export interface BrandKitColors {
  primary: string;
  secondary: string;
}

/** Thin Brand Confirm input may omit secondary (defaults to primary). */
export interface BrandKitColorsInput {
  primary: string;
  secondary?: string;
}

const ALLOWED_TONES: readonly Tone[] = [
  'luxury',
  'professional',
  'playful',
  'bold',
  'friendly',
];

export class BrandKit {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly logoUrl: string,
    public readonly colors: BrandKitColors,
    public readonly tone: Tone,
    public readonly audience: string,
    public readonly thingsToAvoid: string,
    public readonly aiInstructions: string | null,
    public readonly businessDna: BusinessDna | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static assertTone(tone: string): asserts tone is Tone {
    if (!ALLOWED_TONES.includes(tone as Tone)) {
      throw new Error(
        `Invalid tone "${tone}". Allowed: ${ALLOWED_TONES.join(', ')}`,
      );
    }
  }

  static create(
    id: string,
    userId: string,
    name: string,
    logoUrl: string,
    colors: BrandKitColorsInput,
    tone: Tone,
    audience: string,
    thingsToAvoid: string,
    aiInstructions: string | null = null,
    businessDna: BusinessDna | null = null,
  ): BrandKit {
    BrandKit.assertTone(tone);
    const now = new Date();
    return new BrandKit(
      id,
      userId,
      name,
      logoUrl,
      {
        primary: colors.primary,
        secondary: colors.secondary ?? colors.primary,
      },
      tone,
      audience,
      thingsToAvoid,
      aiInstructions,
      businessDna,
      now,
      now,
    );
  }

  update(fields: {
    name?: string;
    logoUrl?: string;
    colors?: BrandKitColorsInput;
    tone?: Tone;
    audience?: string;
    thingsToAvoid?: string;
    aiInstructions?: string | null;
    businessDna?: BusinessDna | null;
  }): BrandKit {
    if (fields.tone !== undefined) {
      BrandKit.assertTone(fields.tone);
    }
    const colors = fields.colors
      ? {
          primary: fields.colors.primary,
          secondary: fields.colors.secondary ?? fields.colors.primary,
        }
      : this.colors;
    return new BrandKit(
      this.id,
      this.userId,
      fields.name ?? this.name,
      fields.logoUrl ?? this.logoUrl,
      colors,
      fields.tone ?? this.tone,
      fields.audience ?? this.audience,
      fields.thingsToAvoid ?? this.thingsToAvoid,
      fields.aiInstructions !== undefined
        ? fields.aiInstructions
        : this.aiInstructions,
      fields.businessDna !== undefined
        ? fields.businessDna
        : this.businessDna,
      this.createdAt,
      new Date(),
    );
  }
}

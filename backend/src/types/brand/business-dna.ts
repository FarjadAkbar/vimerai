import type { Tone } from '@/types/generation/enums';

/** Structured Business DNA persisted on a Brand (Brand Overview + Business Details). */
export interface BusinessDna {
  websiteUrl: string;
  typography: string | null;
  /** Additional hex colors beyond Brand.colors.primary / secondary. */
  colorPalette: string[];
  tagline: string | null;
  values: string[];
  aesthetic: string[];
  /** Free-text voice notes; distinct from closed-set Tone. */
  toneOfVoice: string | null;
  imageStyle: string | null;
  writingStyle: string | null;
  industry: string | null;
  primaryLanguage: string | null;
  elevatorPitch: string | null;
}

export interface HomepageScrapeResult {
  url: string;
  title: string | null;
  description: string | null;
  textContent: string;
  logoCandidateUrl: string | null;
  previewImageUrl: string | null;
}

export interface BusinessDnaExtraction {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  tone: Tone;
  audience: string;
  businessDna: BusinessDna;
}

export function emptyBusinessDna(websiteUrl: string): BusinessDna {
  return {
    websiteUrl,
    typography: null,
    colorPalette: [],
    tagline: null,
    values: [],
    aesthetic: [],
    toneOfVoice: null,
    imageStyle: null,
    writingStyle: null,
    industry: null,
    primaryLanguage: null,
    elevatorPitch: null,
  };
}

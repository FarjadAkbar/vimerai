export type InfluencerGender = "female" | "male" | "non_binary";

export type PortraitSource = "ai" | "upload";

export interface Influencer {
  id: string;
  name: string;
  gender: InfluencerGender;
  age: number;
  ethnicity: string;
  appearancePrompt: string;
  portraitSource: PortraitSource;
  portraitUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InfluencerDraft {
  name: string;
  gender: InfluencerGender;
  age: number;
  ethnicity: string;
  appearancePrompt: string;
  portraitSource: PortraitSource;
  portraitUrl: string | null;
}

export const DEFAULT_INFLUENCER_DRAFT: InfluencerDraft = {
  name: "",
  gender: "female",
  age: 28,
  ethnicity: "",
  appearancePrompt: "",
  portraitSource: "ai",
  portraitUrl: null,
};

export const GENDER_OPTIONS: Array<{ value: InfluencerGender; label: string }> =
  [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "non_binary", label: "Non-binary" },
  ];

export function buildPortraitPrompt(draft: InfluencerDraft): string {
  const genderLabel =
    GENDER_OPTIONS.find((option) => option.value === draft.gender)?.label ??
    draft.gender;
  return [
    `Professional social-media influencer portrait photo.`,
    `Name vibe: ${draft.name || "influencer"}.`,
    `Gender: ${genderLabel}. Age about ${draft.age}.`,
    draft.ethnicity.trim() ? `Ethnicity: ${draft.ethnicity.trim()}.` : "",
    draft.appearancePrompt.trim()
      ? `Appearance: ${draft.appearancePrompt.trim()}.`
      : "Clean modern styling, soft studio light, face clearly visible.",
    "Vertical head-and-shoulders portrait, photoreal, no text, no watermark.",
  ]
    .filter(Boolean)
    .join(" ");
}

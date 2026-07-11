import type { TextSectionKey } from '@/types/generation/generation';

export type TextArtifactKind =
  | 'creative-brief'
  | 'social-post'
  | 'reel-storyboard'
  | 'reel-caption'
  | 'section-regenerate';

export interface PromptLayers {
  qualityAndSafety: string;
  brandKit: string;
  product: string;
  goalAndOptions: string;
  outputSchema: string;
}

export interface TextGenerationRequest {
  artifact: TextArtifactKind;
  layers: PromptLayers;
  /** When regenerating one section, names the target field/scene. */
  sectionKey?: TextSectionKey;
}

export interface TextGenerationResult {
  artifact: TextArtifactKind;
  text: string;
}

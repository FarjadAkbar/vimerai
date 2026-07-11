import type {
  TextGenerationRequest,
  TextGenerationResult,
} from '@/types/generation/text-generation';

export interface ITextGenerationProvider {
  generateText(request: TextGenerationRequest): Promise<TextGenerationResult>;
}

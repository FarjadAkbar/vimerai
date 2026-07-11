import { Injectable, NotImplementedException } from '@nestjs/common';
import type { ITextGenerationProvider } from '@/core/ports/text-generation.provider';
import type {
  TextGenerationRequest,
  TextGenerationResult,
} from '@/types/generation/text-generation';

/** Production placeholder until OpenAI adapter is wired. */
@Injectable()
export class StubTextGenerationProvider implements ITextGenerationProvider {
  async generateText(
    _request: TextGenerationRequest,
  ): Promise<TextGenerationResult> {
    throw new NotImplementedException(
      'Text generation provider is not configured yet',
    );
  }
}

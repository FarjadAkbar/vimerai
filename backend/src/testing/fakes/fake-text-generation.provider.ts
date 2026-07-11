import type { ITextGenerationProvider } from '@/core/ports/text-generation.provider';
import type {
  TextArtifactKind,
  TextGenerationRequest,
  TextGenerationResult,
} from '@/types/generation/text-generation';

export class FakeTextGenerationProvider implements ITextGenerationProvider {
  constructor(
    private readonly responses: Partial<Record<TextArtifactKind, string>> = {},
  ) {}

  async generateText(
    request: TextGenerationRequest,
  ): Promise<TextGenerationResult> {
    const text = this.responses[request.artifact];
    if (text === undefined) {
      throw new Error(
        `FakeTextGenerationProvider has no response for artifact: ${request.artifact}`,
      );
    }
    return {
      artifact: request.artifact,
      text,
    };
  }
}

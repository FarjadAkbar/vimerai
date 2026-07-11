import type { ITextGenerationProvider } from '@/core/ports/text-generation.provider';
import type { TextSectionKey } from '@/types/generation/generation';
import type {
  TextArtifactKind,
  TextGenerationRequest,
  TextGenerationResult,
} from '@/types/generation/text-generation';

export class FakeTextGenerationProvider implements ITextGenerationProvider {
  readonly calls: TextGenerationRequest[] = [];

  constructor(
    private readonly responses: Partial<Record<TextArtifactKind, string>> = {},
    private readonly sectionResponses: Partial<
      Record<TextSectionKey, string>
    > = {},
  ) {}

  async generateText(
    request: TextGenerationRequest,
  ): Promise<TextGenerationResult> {
    this.calls.push(request);
    let text: string | undefined;
    if (request.artifact === 'section-regenerate') {
      text =
        this.sectionResponses[request.sectionKey ?? ''] ??
        this.responses['section-regenerate'];
    } else {
      text = this.responses[request.artifact];
    }
    if (text === undefined) {
      throw new Error(
        `FakeTextGenerationProvider has no response for artifact: ${request.artifact}${
          request.sectionKey ? ` section: ${request.sectionKey}` : ''
        }`,
      );
    }
    return {
      artifact: request.artifact,
      text,
    };
  }
}

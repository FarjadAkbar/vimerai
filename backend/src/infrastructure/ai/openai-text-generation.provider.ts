import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { ITextGenerationProvider } from '@/core/ports/text-generation.provider';
import type {
  PromptLayers,
  TextGenerationRequest,
  TextGenerationResult,
} from '@/types/generation/text-generation';

@Injectable()
export class OpenAiTextGenerationProvider implements ITextGenerationProvider {
  private readonly logger = new Logger(OpenAiTextGenerationProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async generateText(
    request: TextGenerationRequest,
  ): Promise<TextGenerationResult> {
    const apiKey = this.configService.get<string>('openai.apiKey');
    const baseUrl = this.configService.get<string>('openai.baseUrl');
    const model = this.configService.get<string>('openai.model');

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OPENAI_API_KEY is not configured',
      );
    }

    const system = this.buildSystemPrompt(request.layers);
    const user = [
      `Artifact: ${request.artifact}`,
      request.sectionKey ? `Section: ${request.sectionKey}` : '',
      request.layers.outputSchema
        ? `Output requirements:\n${request.layers.outputSchema}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      const response = await axios.post<{
        choices?: Array<{ message?: { content?: string } }>;
      }>(
        `${baseUrl}/chat/completions`,
        {
          model,
          temperature: 0.7,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60_000,
        },
      );

      const text = response.data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new ServiceUnavailableException(
          'OpenAI returned an empty response',
        );
      }

      return { artifact: request.artifact, text };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error(
        `OpenAI text generation failed for ${request.artifact}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(
        error instanceof Error
          ? error.message
          : 'OpenAI text generation failed',
      );
    }
  }

  private buildSystemPrompt(layers: PromptLayers): string {
    return [
      layers.qualityAndSafety,
      '## Brand Kit',
      layers.brandKit,
      '## Product',
      layers.product,
      '## Goal and options',
      layers.goalAndOptions,
    ].join('\n\n');
  }
}

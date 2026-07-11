import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';
import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type { IStorageService } from '@/core/ports/storage.service';
import { STORAGE_SERVICE_TOKEN } from '@/core/tokens/injection.tokens';
import type {
  ImageGenerationRequest,
  ImageGenerationResult,
} from '@/types/generation/image-generation';

@Injectable()
export class OpenAiImageGenerationProvider implements IImageGenerationProvider {
  private readonly logger = new Logger(OpenAiImageGenerationProvider.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
  ) {}

  async generateImage(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    const apiKey = this.configService.get<string>('openai.apiKey');
    const baseUrl = this.configService.get<string>('openai.baseUrl');
    const model =
      this.configService.get<string>('openai.imageModel') || 'gpt-image-1';

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OPENAI_API_KEY is not configured',
      );
    }

    if (request.productImageUrls.length === 0) {
      throw new ServiceUnavailableException(
        'Product image conditioning URLs are required for AI Post image',
      );
    }

    const prompt = [
      request.prompt,
      'Use the attached Product photo(s) as visual conditioning — keep the product recognizable.',
      'Photoreal ecommerce social feed still.',
      request.negativePrompt ? `Avoid: ${request.negativePrompt}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const form = new FormData();
      form.append('model', model);
      form.append('prompt', prompt);
      form.append('size', '1024x1024');
      form.append('quality', 'medium');

      for (const [index, url] of request.productImageUrls.entries()) {
        const imageResponse = await axios.get<ArrayBuffer>(url, {
          responseType: 'arraybuffer',
          timeout: 60_000,
        });
        const contentType =
          String(imageResponse.headers['content-type'] || 'image/png').split(
            ';',
          )[0] || 'image/png';
        const extension = contentType.includes('jpeg')
          ? 'jpg'
          : contentType.includes('webp')
            ? 'webp'
            : 'png';
        form.append('image[]', Buffer.from(imageResponse.data), {
          filename: `product-${index}.${extension}`,
          contentType,
        });
      }

      const response = await axios.post<{
        data?: Array<{ b64_json?: string; url?: string }>;
      }>(`${baseUrl}/images/edits`, form, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...form.getHeaders(),
        },
        timeout: 120_000,
        maxBodyLength: Infinity,
      });

      const first = response.data.data?.[0];
      if (first?.url) {
        return { imageUrl: first.url };
      }

      const b64 = first?.b64_json;
      if (!b64) {
        throw new ServiceUnavailableException(
          'OpenAI returned an empty image payload',
        );
      }

      const buffer = Buffer.from(b64, 'base64');
      const key = `generations/post-images/${uuidv4()}.png`;
      const imageUrl = await this.storageService.upload(
        key,
        buffer,
        'image/png',
      );
      return { imageUrl };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error(
        'OpenAI image generation failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(
        error instanceof Error
          ? error.message
          : 'OpenAI image generation failed',
      );
    }
  }
}

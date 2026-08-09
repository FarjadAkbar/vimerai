import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type {
  ImageGenerationRequest,
  ImageGenerationResult,
} from '@/types/generation/image-generation';

type FalQueueStatus = 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

interface FalConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout: number;
}

interface FalSubmitResponse {
  request_id: string;
  status?: FalQueueStatus;
  status_url?: string;
  response_url?: string;
}

interface FalQueueStatusResponse {
  status: FalQueueStatus;
  response_url?: string;
  error?: string;
  detail?: string | Array<{ msg?: string }>;
}

interface FalImageFile {
  url?: string;
}

interface FalResultResponse {
  images?: FalImageFile[];
  error?: string;
  detail?: string | Array<{ msg?: string }>;
}

interface FalRequestUrls {
  statusUrl: string;
  responseUrl: string;
}

@Injectable()
export class FalImageGenerationProvider implements IImageGenerationProvider {
  private readonly logger = new Logger(FalImageGenerationProvider.name);
  private readonly falConfig: FalConfig;
  private readonly pollIntervalMs = 2_000;

  constructor(private readonly configService: ConfigService) {
    const falConfig = this.configService.get<FalConfig>('imageGeneration.fal');

    if (!falConfig) {
      throw new Error('Image generation fal configuration is missing');
    }

    if (!falConfig.apiKey) {
      throw new Error('FAL_KEY is missing');
    }

    this.falConfig = falConfig;
  }

  async generateImage(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    const prompt = request.prompt?.trim();
    if (!prompt) {
      throw new ServiceUnavailableException(
        'prompt is required for fal.ai image generation',
      );
    }

    const imageUrl = request.productImageUrls.find((url) => url?.trim());
    if (!imageUrl) {
      throw new ServiceUnavailableException(
        'Product image conditioning URLs are required for AI Post image',
      );
    }

    const composedPrompt = [
      prompt,
      'Use the Product photo as visual conditioning — keep the product recognizable.',
      'Photoreal ecommerce Instagram feed still.',
      request.negativePrompt?.trim()
        ? `Avoid: ${request.negativePrompt.trim()}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const submitEndpoint = this.joinUrl(
        this.falConfig.baseUrl,
        this.falConfig.model,
      );
      const submitResponse = await axios.post<FalSubmitResponse>(
        submitEndpoint,
        {
          prompt: composedPrompt,
          image_url: imageUrl,
          aspect_ratio: '1:1',
          num_images: 1,
          output_format: 'png',
        },
        {
          headers: this.jsonHeaders(),
          timeout: this.falConfig.timeout,
        },
      );

      const requestId = submitResponse.data.request_id;
      if (!requestId) {
        throw new ServiceUnavailableException(
          'fal.ai did not return a request_id for image generation',
        );
      }

      const urls: FalRequestUrls = {
        statusUrl:
          submitResponse.data.status_url ||
          this.buildStatusUrl(requestId),
        responseUrl:
          submitResponse.data.response_url ||
          this.buildResponseUrl(requestId),
      };

      const result = await this.waitForResult(urls);
      const generatedUrl = result.images?.find((image) => image.url?.trim())
        ?.url;

      if (!generatedUrl) {
        throw new ServiceUnavailableException(
          'fal.ai completed but returned no image URL',
        );
      }

      return { imageUrl: generatedUrl };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error(
        'fal.ai image generation failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw this.toUnavailable(error, 'fal.ai image generation failed');
    }
  }

  private async waitForResult(
    urls: FalRequestUrls,
  ): Promise<FalResultResponse> {
    const deadline = Date.now() + this.falConfig.timeout;

    while (Date.now() < deadline) {
      const statusResponse = await axios.get<FalQueueStatusResponse>(
        urls.statusUrl,
        {
          headers: this.authHeaders(),
          timeout: this.falConfig.timeout,
          validateStatus: (status) => status < 500,
        },
      );

      if (statusResponse.status >= 400) {
        throw new ServiceUnavailableException(
          `fal.ai status check failed: HTTP ${statusResponse.status}`,
        );
      }

      const payload = statusResponse.data;
      if (payload.status === 'FAILED' || payload.error) {
        throw new ServiceUnavailableException(
          this.extractErrorMessage(payload),
        );
      }

      if (payload.status === 'COMPLETED') {
        const responseUrl = payload.response_url || urls.responseUrl;
        const resultResponse = await axios.get<FalResultResponse>(
          responseUrl,
          {
            headers: this.authHeaders(),
            timeout: this.falConfig.timeout,
          },
        );
        return resultResponse.data;
      }

      await this.sleep(this.pollIntervalMs);
    }

    throw new ServiceUnavailableException('fal.ai image generation timed out');
  }

  private buildStatusUrl(requestId: string): string {
    return `${this.modelBaseUrl()}requests/${requestId}/status`;
  }

  private buildResponseUrl(requestId: string): string {
    return `${this.modelBaseUrl()}requests/${requestId}`;
  }

  private modelBaseUrl(): string {
    const joined = this.joinUrl(this.falConfig.baseUrl, this.falConfig.model);
    return joined.endsWith('/') ? joined : `${joined}/`;
  }

  private joinUrl(baseUrl: string, model: string): string {
    const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const path = model.replace(/^\/+/, '');
    return `${base}${path}`;
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Key ${this.falConfig.apiKey}`,
    };
  }

  private jsonHeaders(): Record<string, string> {
    return {
      Authorization: `Key ${this.falConfig.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private extractErrorMessage(
    payload: FalQueueStatusResponse | FalResultResponse,
  ): string {
    if (typeof payload.error === 'string' && payload.error) {
      return payload.error;
    }

    if (typeof payload.detail === 'string' && payload.detail) {
      return payload.detail;
    }

    if (Array.isArray(payload.detail)) {
      const messages = payload.detail
        .map((item) => item.msg)
        .filter((msg): msg is string => Boolean(msg));
      if (messages.length > 0) {
        return messages.join('; ');
      }
    }

    return 'fal.ai image generation failed';
  }

  private toUnavailable(
    error: unknown,
    prefix: string,
  ): ServiceUnavailableException {
    if (axios.isAxiosError(error)) {
      return new ServiceUnavailableException(
        `${prefix}: ${this.axiosErrorMessage(error)}`,
      );
    }

    return new ServiceUnavailableException(
      `${prefix}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  private axiosErrorMessage(error: AxiosError): string {
    const status = error.response?.status;
    const data = error.response?.data;
    const statusPart = status ? `HTTP ${status}` : error.message;

    if (typeof data === 'string' && data) {
      return `${statusPart}: ${data}`;
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.detail === 'string') {
        return `${statusPart}: ${record.detail}`;
      }
      if (typeof record.error === 'string') {
        return `${statusPart}: ${record.error}`;
      }
      if (typeof record.message === 'string') {
        return `${statusPart}: ${record.message}`;
      }
    }

    return statusPart;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

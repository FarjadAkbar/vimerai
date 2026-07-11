import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import {
  IVideoGenerationProvider,
  GenerateVideoRequest,
  GenerateVideoResponse,
} from '@/core/ports/video-generation.provider';
import { GenerationMode } from '@/domain/video.entity';

type FalQueueStatus = 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

interface FalQueueStatusResponse {
  status: FalQueueStatus;
  request_id?: string;
  queue_position?: number;
  response_url?: string;
  status_url?: string;
  error?: string;
  detail?: string | Array<{ msg?: string }>;
}

interface FalVideoFile {
  url?: string;
}

interface FalImageFile {
  url?: string;
}

interface FalResultResponse {
  video?: FalVideoFile;
  video_url?: string;
  images?: FalImageFile[];
  detail?: string | Array<{ msg?: string }>;
  error?: string;
}

interface FalSubmitResponse {
  request_id: string;
  status?: FalQueueStatus;
  status_url?: string;
  response_url?: string;
  cancel_url?: string;
}

interface FalRequestUrls {
  statusUrl: string;
  responseUrl: string;
}

interface FalConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout: number;
}

@Injectable()
export class FalVideoGenerationProvider implements IVideoGenerationProvider {
  private readonly falConfig: FalConfig;
  private readonly modelEndpoint: string;
  /** fal returns status_url / response_url on submit; prefer those over reconstructing paths. */
  private readonly requestUrls = new Map<string, FalRequestUrls>();

  constructor(private readonly configService: ConfigService) {
    const falConfig = this.configService.get<FalConfig>('videoGeneration.fal');

    if (!falConfig) {
      throw new Error('Video generation fal configuration is missing');
    }

    if (!falConfig.apiKey) {
      throw new Error('FAL_KEY is missing');
    }

    this.falConfig = falConfig;
    this.modelEndpoint = this.joinUrl(falConfig.baseUrl, falConfig.model);
  }

  async generateVideo(
    request: GenerateVideoRequest,
  ): Promise<GenerateVideoResponse> {
    const prompt = request.prompt?.trim();
    if (!prompt) {
      throw new BadRequestException('prompt is required for fal.ai generation');
    }

    const useImageConditioning =
      !!request.useImageConditioning &&
      (request.productAssetUrls?.length ?? 0) > 0;

    const modelPath = useImageConditioning
      ? request.imageToVideoModel ?? 'pika/v2.2/image-to-video'
      : request.textToVideoModel ?? this.falConfig.model;

    const submitEndpoint = this.joinUrl(this.falConfig.baseUrl, modelPath);

    try {
      const body = this.buildSubmitBody(request, prompt, useImageConditioning);

      const response = await axios.post<FalSubmitResponse>(
        submitEndpoint,
        body,
        {
          headers: this.jsonHeaders(),
          timeout: this.falConfig.timeout,
        },
      );

      const requestId = response.data.request_id;
      if (!requestId) {
        throw new BadRequestException(
          'fal.ai did not return a request_id for the generation job',
        );
      }

      // Status/result use /pika/requests/{id}/... (not the full model path).
      this.requestUrls.set(requestId, {
        statusUrl: this.buildStatusUrl(requestId),
        responseUrl:
          response.data.response_url || this.buildResponseUrl(requestId),
      });

      return {
        jobId: requestId,
        status: this.mapFalStatus(response.data.status ?? 'IN_QUEUE'),
      };
    } catch (error) {
      throw this.toBadRequest(error, 'fal.ai submit failed');
    }
  }

  async getGenerationStatus(jobId: string): Promise<GenerateVideoResponse> {
    const urls = this.resolveUrls(jobId);

    try {
      // GET must not send Content-Type: application/json (fal may respond 405).
      const statusResponse = await axios.get<FalQueueStatusResponse>(
        urls.statusUrl,
        {
          headers: this.authHeaders(),
          params: { logs: 1 },
          timeout: this.falConfig.timeout,
          validateStatus: (status) => status < 500,
        },
      );

      if (statusResponse.status === 405) {
        // Retry without query params in case the gateway rejects them.
        const retry = await axios.get<FalQueueStatusResponse>(urls.statusUrl, {
          headers: this.authHeaders(),
          timeout: this.falConfig.timeout,
        });
        const responseUrl = retry.data.response_url || urls.responseUrl;
        return this.mapStatusPayload(jobId, retry.data, responseUrl);
      }

      if (statusResponse.status >= 400) {
        throw new BadRequestException(
          `fal.ai status check failed: HTTP ${statusResponse.status} for ${urls.statusUrl}`,
        );
      }

      const responseUrl = statusResponse.data.response_url || urls.responseUrl;
      return this.mapStatusPayload(jobId, statusResponse.data, responseUrl);
    } catch (error) {
      throw this.toBadRequest(
        error,
        `fal.ai status check failed (${urls.statusUrl})`,
      );
    }
  }

  async generatePreview(
    prompt: string,
    jobId?: string,
  ): Promise<GenerateVideoResponse> {
    return this.generateVideo({
      prompt,
      mode: GenerationMode.FAST,
      jobId,
    });
  }

  async downloadVideo(videoId: string): Promise<Buffer> {
    try {
      let mediaUrl: string | undefined;

      if (videoId.startsWith('http://') || videoId.startsWith('https://')) {
        mediaUrl = videoId;
      } else {
        const result = await this.fetchResult(videoId);
        mediaUrl = this.extractMediaUrl(result);
      }

      if (!mediaUrl) {
        throw new BadRequestException(
          `No media URL found for fal request ${videoId}`,
        );
      }

      const response = await axios.get<ArrayBuffer>(mediaUrl, {
        responseType: 'arraybuffer',
        timeout: this.falConfig.timeout,
      });

      return Buffer.from(response.data);
    } catch (error) {
      throw this.toBadRequest(error, 'fal.ai video download failed');
    }
  }

  private async mapStatusPayload(
    jobId: string,
    payload: FalQueueStatusResponse,
    responseUrl: string,
  ): Promise<GenerateVideoResponse> {
    const falStatus = payload.status;
    const mapped = this.mapFalStatus(falStatus);

    // fal may report COMPLETED with an error field when the run failed.
    if (mapped === 'completed' && payload.error) {
      return {
        jobId,
        status: 'failed',
        error: payload.error,
      };
    }

    if (mapped === 'failed') {
      return {
        jobId,
        status: 'failed',
        error: this.extractErrorMessage(payload),
      };
    }

    if (mapped !== 'completed') {
      return {
        jobId,
        status: mapped,
      };
    }

    const result = await this.fetchResultFromUrl(responseUrl);
    const mediaUrl = this.extractMediaUrl(result);

    if (!mediaUrl) {
      return {
        jobId,
        status: 'failed',
        error: 'fal.ai completed but returned no media URL',
      };
    }

    return {
      jobId,
      status: 'completed',
      videoUrl: mediaUrl,
      previewUrl: mediaUrl,
    };
  }

  private buildSubmitBody(
    request: GenerateVideoRequest,
    prompt: string,
    useImageConditioning: boolean,
  ): Record<string, string | number> {
    const body = this.buildPromptBody(prompt, request.mode);

    if (request.negativePrompt?.trim()) {
      body.negative_prompt = request.negativePrompt.trim();
    }

    if (useImageConditioning) {
      const imageUrl = request.productAssetUrls?.find((url) => url?.trim());
      if (!imageUrl) {
        throw new BadRequestException(
          'productAssetUrls required for image-conditioned video',
        );
      }
      body.image_url = imageUrl;
    }

    return body;
  }

  private buildPromptBody(
    prompt: string,
    mode: GenerationMode,
  ): Record<string, string | number> {
    const body: Record<string, string | number> = { prompt };

    switch (mode) {
      case GenerationMode.FAST:
        body.duration = 5;
        break;
      case GenerationMode.CINEMATIC:
        body.duration = 10;
        break;
      case GenerationMode.AVATAR:
        body.duration = 5;
        break;
      default:
        break;
    }

    return body;
  }

  private resolveUrls(requestId: string): FalRequestUrls {
    const cached = this.requestUrls.get(requestId);
    if (cached) {
      return cached;
    }

    const urls = {
      statusUrl: this.buildStatusUrl(requestId),
      responseUrl: this.buildResponseUrl(requestId),
    };
    this.requestUrls.set(requestId, urls);
    return urls;
  }

  /**
   * Poll status at: {baseUrl}/pika/requests/{request_id}/status
   * e.g. https://queue.fal.run/fal-ai/pika/requests/{id}/status
   */
  private buildStatusUrl(requestId: string): string {
    return `${this.queueBaseUrl()}pika/requests/${requestId}/status`;
  }

  /** Result at: {baseUrl}/pika/requests/{request_id}/response */
  private buildResponseUrl(requestId: string): string {
    return `${this.queueBaseUrl()}pika/requests/${requestId}/response`;
  }

  private queueBaseUrl(): string {
    const base = this.falConfig.baseUrl;
    return base.endsWith('/') ? base : `${base}/`;
  }

  private async fetchResult(requestId: string): Promise<FalResultResponse> {
    const urls = this.resolveUrls(requestId);
    return this.fetchResultFromUrl(urls.responseUrl);
  }

  private async fetchResultFromUrl(
    responseUrl: string,
  ): Promise<FalResultResponse> {
    const response = await axios.get<FalResultResponse>(responseUrl, {
      headers: this.authHeaders(),
      timeout: this.falConfig.timeout,
    });
    return response.data;
  }

  private extractMediaUrl(result: FalResultResponse): string | undefined {
    if (result.video?.url) {
      return result.video.url;
    }
    if (result.video_url) {
      return result.video_url;
    }
    const firstImage = result.images?.find((image) => image.url?.trim());
    return firstImage?.url;
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

  private mapFalStatus(
    status: string | undefined,
  ): GenerateVideoResponse['status'] {
    switch (status) {
      case 'IN_QUEUE':
        return 'pending';
      case 'IN_PROGRESS':
        return 'processing';
      case 'COMPLETED':
        return 'completed';
      case 'FAILED':
        return 'failed';
      default:
        return 'pending';
    }
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

    return 'fal.ai request failed';
  }

  private toBadRequest(error: unknown, prefix: string): BadRequestException {
    if (error instanceof BadRequestException) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      return new BadRequestException(
        `${prefix}: ${this.axiosErrorMessage(error)}`,
      );
    }

    return new BadRequestException(
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
}

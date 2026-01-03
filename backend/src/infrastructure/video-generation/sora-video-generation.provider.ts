import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IVideoGenerationProvider,
  GenerateVideoRequest,
  GenerateVideoResponse,
} from '@/core/ports/video-generation.provider';
import { GenerationMode } from '@/domain/video.entity';

@Injectable()
export class SoraVideoGenerationProvider implements IVideoGenerationProvider {
  private axiosInstance: AxiosInstance;
  private readonly soraConfig: {
    apiKey: string;
    apiUrl: string;
    timeout: number;
  };

  constructor(private readonly configService: ConfigService) {
    const soraConfig = this.configService.get<{
      apiKey: string;
      apiUrl: string;
      timeout: number;
    }>('videoGeneration.sora');

    if (!soraConfig) {
      throw new Error('Video generation configuration is missing');
    }

    this.soraConfig = soraConfig;
    this.axiosInstance = axios.create({
      baseURL: this.soraConfig.apiUrl,
      timeout: this.soraConfig.timeout,
      headers: {
        Authorization: `Bearer ${this.soraConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async generateVideo(
    request: GenerateVideoRequest,
  ): Promise<GenerateVideoResponse> {
    try {
      // Map our generation modes to Sora parameters
      const soraParams = this.mapToSoraParams(request);

      const response = await this.axiosInstance.post('/generations', {
        model: 'sora-1.0',
        prompt: request.prompt,
        ...soraParams,
      });

      // Sora API typically returns a job ID and status
      return {
        jobId: response.data.id || response.data.job_id,
        status: this.mapSoraStatus(response.data.status),
        videoUrl: response.data.video_url,
        previewUrl: response.data.preview_url,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Sora API error: ${error.response?.data?.error?.message || error.message}`,
        );
      }
      throw new BadRequestException(
        `Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getGenerationStatus(jobId: string): Promise<GenerateVideoResponse> {
    try {
      const response = await this.axiosInstance.get(`/generations/${jobId}`);

      return {
        jobId: response.data.id || jobId,
        status: this.mapSoraStatus(response.data.status),
        videoUrl: response.data.video_url,
        previewUrl: response.data.preview_url,
        error: response.data.error,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Sora API error: ${error.response?.data?.error?.message || error.message}`,
        );
      }
      throw new BadRequestException(
        `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async generatePreview(prompt: string): Promise<{ previewUrl: string }> {
    try {
      // For preview, use a shorter duration and lower quality
      const response = await this.axiosInstance.post('/generations', {
        model: 'sora-1.0',
        prompt,
        duration: 3, // 3 seconds for preview
        quality: 'standard',
        preview: true,
      });

      return {
        previewUrl: response.data.preview_url || response.data.video_url,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Sora API error: ${error.response?.data?.error?.message || error.message}`,
        );
      }
      throw new BadRequestException(
        `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private mapToSoraParams(request: GenerateVideoRequest): Record<string, any> {
    const baseParams: Record<string, any> = {
      duration: 10, // Default 10 seconds
      quality: 'hd',
    };

    switch (request.mode) {
      case GenerationMode.FAST:
        return {
          ...baseParams,
          duration: 5,
          quality: 'standard',
        };
      case GenerationMode.CINEMATIC:
        return {
          ...baseParams,
          duration: 30,
          quality: 'hd',
        };
      case GenerationMode.AVATAR:
        return {
          ...baseParams,
          duration: 10,
          quality: 'hd',
          avatar_mode: true,
        };
      default:
        return baseParams;
    }
  }

  private mapSoraStatus(
    soraStatus: string,
  ): 'pending' | 'processing' | 'completed' | 'failed' {
    const statusMap: Record<
      string,
      'pending' | 'processing' | 'completed' | 'failed'
    > = {
      pending: 'pending',
      queued: 'pending',
      processing: 'processing',
      in_progress: 'processing',
      completed: 'completed',
      succeeded: 'completed',
      failed: 'failed',
      error: 'failed',
    };

    return statusMap[soraStatus?.toLowerCase()] || 'pending';
  }
}

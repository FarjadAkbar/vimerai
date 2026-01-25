import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import {
  IVideoGenerationProvider,
  GenerateVideoRequest,
  GenerateVideoResponse,
} from '@/core/ports/video-generation.provider';
import { GenerationMode } from '@/domain/video.entity';

@Injectable()
export class SoraVideoGenerationProvider implements IVideoGenerationProvider {
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

    if (!soraConfig.apiKey) {
      throw new Error('Sora API key is missing');
    }

    this.soraConfig = soraConfig;
    console.log('soraConfig loaded:', {
      apiUrl: this.soraConfig.apiUrl,
      timeout: this.soraConfig.timeout,
      apiKeyPresent: !!this.soraConfig.apiKey,
      apiKeyPrefix: this.soraConfig.apiKey.substring(0, 7) + '...',
    });
  }

  async generateVideo(
    request: GenerateVideoRequest,
  ): Promise<GenerateVideoResponse> {
    try {
      // Map our generation modes to Sora parameters
      const soraParams = this.mapToSoraParams(request);

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('model', 'sora-2-pro');
      formData.append('prompt', request.prompt);
      formData.append('size', soraParams.size || '1280x720');
      formData.append('seconds', String(soraParams.seconds || 8));

      // Get FormData headers (includes Content-Type with boundary)
      const formHeaders = formData.getHeaders();

      console.log('Sending request to:', this.soraConfig.apiUrl);
      console.log('FormData fields:', {
        model: 'sora-2-pro',
        prompt: request.prompt,
        size: soraParams.size || '1280x720',
        seconds: String(soraParams.seconds || 8),
      });

      const response = await axios.post(this.soraConfig.apiUrl, formData, {
        headers: {
          ...formHeaders,
          Authorization: `Bearer ${this.soraConfig.apiKey}`,
        },
        timeout: this.soraConfig.timeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // Sora API returns a video ID - extract it from various possible response fields
      // This video ID will be used as the jobId for status checking
      const videoId =
        response.data.id ||
        response.data.video_id ||
        response.data.job_id ||
        response.data.videoId ||
        request.jobId; // Fallback to provided jobId if Sora doesn't return one

      console.log('Sora API response:', {
        videoId,
        status: response.data.status,
        hasVideoUrl: !!response.data.video_url,
        responseData: response.data,
      });

      return {
        jobId: videoId, // Return the video ID as jobId for status checks
        status: this.mapSoraStatus(response.data.status),
        videoUrl: response.data.video_url,
        previewUrl: response.data.preview_url,
      };
    } catch (error) {
      console.log('error', error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.error?.message || error.message;
        throw new BadRequestException(`Sora API error: ${errorMessage}`);
      }
      throw new BadRequestException(
        `Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getGenerationStatus(jobId: string): Promise<GenerateVideoResponse> {
    try {
      console.log('Getting generation status for:', jobId);
      const response = await axios.get(`${this.soraConfig.apiUrl}/${jobId}`, {
        headers: {
          Authorization: `Bearer ${this.soraConfig.apiKey}`,
        },
        timeout: this.soraConfig.timeout,
      });

      console.log('Generation status response:', response.data);

      return {
        jobId: response.data.id || jobId,
        status: this.mapSoraStatus(response.data.status),
        videoUrl: response.data.video_url,
        previewUrl: response.data.preview_url,
        error: response.data.error,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.error?.message || error.message;
        throw new BadRequestException(`Sora API error: ${errorMessage}`);
      }
      throw new BadRequestException(
        `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async generatePreview(prompt: string, jobId?: string): Promise<GenerateVideoResponse> {
    try {
      // For preview, use a shorter duration
      const formData = new FormData();
      formData.append('model', 'sora-2-pro');
      formData.append('prompt', prompt);
      formData.append('size', '1280x720');
      formData.append('seconds', '4'); // Minimum supported duration for preview

      // Get FormData headers (includes Content-Type with boundary)
      const formHeaders = formData.getHeaders();

      const response = await axios.post(this.soraConfig.apiUrl, formData, {
        headers: {
          ...formHeaders,
          Authorization: `Bearer ${this.soraConfig.apiKey}`,
        },
        timeout: this.soraConfig.timeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // Sora API returns a video ID - extract it from various possible response fields
      const videoId =
        response.data.id ||
        response.data.video_id ||
        response.data.job_id ||
        response.data.videoId ||
        jobId; // Fallback to provided jobId if Sora doesn't return one

      return {
        jobId: videoId,
        status: this.mapSoraStatus(response.data.status || 'pending'),
        previewUrl: response.data.preview_url || response.data.video_url,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.error?.message || error.message;
        throw new BadRequestException(`Sora API error: ${errorMessage}`);
      }
      throw new BadRequestException(
        `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private mapToSoraParams(request: GenerateVideoRequest): Record<string, unknown> {
    const baseParams: Record<string, unknown> = {
      seconds: 8, // Default 8 seconds (supported values: 4, 8, 12)
      size: '1280x720',
    };

    switch (request.mode) {
      case GenerationMode.FAST:
        return {
          ...baseParams,
          seconds: 4, // Shortest supported duration
        };
      case GenerationMode.CINEMATIC:
        return {
          ...baseParams,
          seconds: 12, // Longest supported duration
        };
      case GenerationMode.AVATAR:
        return {
          ...baseParams,
          seconds: 8, // Medium duration
        };
      default:
        return baseParams;
    }
  }

  async downloadVideo(videoId: string): Promise<Buffer> {
    try {
      // Sora API download endpoint: /v1/videos/{video_id}/content
      const baseUrl = this.soraConfig.apiUrl.replace('/v1/videos', '');
      const downloadUrl = `${baseUrl}/v1/videos/${videoId}/content`;

      console.log('Downloading video from:', downloadUrl);

      const response = await axios.get(downloadUrl, {
        headers: {
          Authorization: `Bearer ${this.soraConfig.apiKey}`,
        },
        responseType: 'arraybuffer',
        timeout: this.soraConfig.timeout,
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.log('Download error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.error?.message || error.message;
        throw new BadRequestException(`Sora API error: ${errorMessage}`);
      }
      throw new BadRequestException(
        `Video download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
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

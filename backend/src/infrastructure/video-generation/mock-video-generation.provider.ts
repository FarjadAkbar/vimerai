import { Injectable } from '@nestjs/common';
import {
  IVideoGenerationProvider,
  GenerateVideoRequest,
  GenerateVideoResponse,
} from '@/core/ports/video-generation.provider';
import { GenerationMode } from '@/domain/video.entity';

/**
 * Mock video generation provider for demonstration purposes.
 * Simulates video generation with realistic delays and returns sample video URLs.
 */
@Injectable()
export class MockVideoGenerationProvider implements IVideoGenerationProvider {
  // Store job statuses in memory (in production, this would be in a database)
  private jobStatuses: Map<
    string,
    {
      status: 'pending' | 'processing' | 'completed' | 'failed';
      videoUrl?: string;
      previewUrl?: string;
      createdAt: number;
    }
  > = new Map();

  // Sample video URLs for demonstration
  private readonly SAMPLE_VIDEOS = [
    'https://lorem.video/720p',
    'https://lorem.video/720p_h264_10s',
    'https://lorem.video/cat_128kbps',
    'https://lorem.video/corgi_128kbps',
    'https://lorem.video/bunny_128kbps',
  ];

  async generateVideo(
    request: GenerateVideoRequest,
  ): Promise<GenerateVideoResponse> {
    // Use provided jobId if available, otherwise generate one
    const jobId = request.jobId || `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get a random sample video
    const randomVideo = this.SAMPLE_VIDEOS[
      Math.floor(Math.random() * this.SAMPLE_VIDEOS.length)
    ];

    // Initialize job as pending
    this.jobStatuses.set(jobId, {
      status: 'pending',
      createdAt: Date.now(),
    });

    // Simulate async processing
    this.processVideoGeneration(jobId, randomVideo, request.mode).catch(
      (error) => {
        console.error('Mock video generation error:', error);
        this.jobStatuses.set(jobId, {
          status: 'failed',
          createdAt: Date.now(),
        });
      },
    );

    return {
      jobId,
      status: 'pending',
    };
  }

  async getGenerationStatus(jobId: string): Promise<GenerateVideoResponse> {
    const job = this.jobStatuses.get(jobId);

    if (!job) {
      return {
        jobId,
        status: 'failed',
        error: 'Job not found',
      };
    }

    return {
      jobId,
      status: job.status,
      videoUrl: job.videoUrl,
      previewUrl: job.previewUrl,
    };
  }

  async generatePreview(prompt: string, jobId?: string): Promise<GenerateVideoResponse> {
    // Use provided jobId if available, otherwise generate one
    const previewJobId = jobId || `mock_preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get a random sample video for preview
    const previewUrl =
      this.SAMPLE_VIDEOS[
        Math.floor(Math.random() * this.SAMPLE_VIDEOS.length)
      ];

    // Initialize job as pending
    this.jobStatuses.set(previewJobId, {
      status: 'pending',
      createdAt: Date.now(),
    });

    // Simulate async preview processing (shorter delay than full video)
    this.processPreviewGeneration(previewJobId, previewUrl).catch(
      (error) => {
        console.error('Mock preview generation error:', error);
        this.jobStatuses.set(previewJobId, {
          status: 'failed',
          createdAt: Date.now(),
        });
      },
    );

    return {
      jobId: previewJobId,
      status: 'pending',
    };
  }

  /**
   * Simulates preview generation with realistic delays (shorter than full video)
   */
  private async processPreviewGeneration(
    jobId: string,
    previewUrl: string,
  ): Promise<void> {
    // Preview is faster - 2 seconds delay
    const delay = 2000;

    // Update to processing after 0.5 seconds
    setTimeout(() => {
      const job = this.jobStatuses.get(jobId);
      if (job) {
        this.jobStatuses.set(jobId, {
          ...job,
          status: 'processing',
        });
      }
    }, 500);

    // Complete after the delay
    setTimeout(() => {
      const job = this.jobStatuses.get(jobId);
      if (job) {
        this.jobStatuses.set(jobId, {
          ...job,
          status: 'completed',
          previewUrl,
        });
      }
    }, delay);
  }

  async downloadVideo(videoId: string): Promise<Buffer> {
    // videoId can be either a jobId or a videoUrl
    // First, try to find it in our job statuses (it's a jobId)
    const job = this.jobStatuses.get(videoId);
    let videoUrl: string;

    if (job?.videoUrl) {
      // Found job with videoUrl
      videoUrl = job.videoUrl;
    } else if (videoId.startsWith('http')) {
      // It's already a URL
      videoUrl = videoId;
    } else {
      // Fallback to sample video
      videoUrl = this.SAMPLE_VIDEOS[0];
    }

    try {
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new Error(
        `Video download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Simulates video generation with realistic delays
   */
  private async processVideoGeneration(
    jobId: string,
    videoUrl: string,
    mode: GenerationMode,
  ): Promise<void> {
    // Simulate processing delay based on mode
    const delays: Record<GenerationMode, number> = {
      [GenerationMode.FAST]: 3000, // 3 seconds for fast mode
      [GenerationMode.CINEMATIC]: 8000, // 8 seconds for cinematic
      [GenerationMode.AVATAR]: 5000, // 5 seconds for avatar
    };

    const delay = delays[mode] || 3000;

    // Update to processing after 1 second
    setTimeout(() => {
      const job = this.jobStatuses.get(jobId);
      if (job) {
        this.jobStatuses.set(jobId, {
          ...job,
          status: 'processing',
        });
      }
    }, 1000);

    // Complete after the delay
    setTimeout(() => {
      const job = this.jobStatuses.get(jobId);
      if (job) {
        this.jobStatuses.set(jobId, {
          ...job,
          status: 'completed',
          videoUrl,
          previewUrl: videoUrl, // Use same URL for preview
        });
      }
    }, delay);
  }
}


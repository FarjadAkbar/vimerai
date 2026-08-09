import type {
  GenerateVideoRequest,
  GenerateVideoResponse,
  IVideoGenerationProvider,
} from '@/core/ports/video-generation.provider';
import { GenerationMode } from '@/domain/video.entity';

export class FakeVideoGenerationProvider implements IVideoGenerationProvider {
  readonly generateCalls: GenerateVideoRequest[] = [];
  readonly stitchCalls: string[][] = [];
  failNextGenerate = false;
  failNextStitch = false;

  constructor(private readonly videoUrl: string) {}

  async generateVideo(
    request: GenerateVideoRequest,
  ): Promise<GenerateVideoResponse> {
    this.generateCalls.push(request);
    if (this.failNextGenerate) {
      this.failNextGenerate = false;
      throw new Error('AI Video provider failed');
    }
    const jobId = `fal-video-${this.generateCalls.length}`;
    return {
      jobId,
      status: 'completed',
      videoUrl: `${this.videoUrl.replace(/\.mp4$/, '')}-clip-${this.generateCalls.length}.mp4`,
    };
  }

  async getGenerationStatus(jobId: string): Promise<GenerateVideoResponse> {
    return {
      jobId,
      status: 'completed',
      videoUrl: this.videoUrl,
    };
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

  async downloadVideo(_videoId: string): Promise<Buffer> {
    return Buffer.from('fake-video');
  }

  async stitchClips(clipUrls: string[]): Promise<GenerateVideoResponse> {
    this.stitchCalls.push([...clipUrls]);
    if (this.failNextStitch) {
      this.failNextStitch = false;
      throw new Error('AI Video stitch failed');
    }
    return {
      jobId: `stitch-${this.stitchCalls.length}`,
      status: 'completed',
      videoUrl: this.videoUrl,
    };
  }
}

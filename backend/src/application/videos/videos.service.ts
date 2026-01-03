import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IVideoRepository } from '@/core/ports/video.repository';

@Injectable()
export class VideosService {
  constructor(
    @Inject('IVideoRepository')
    private readonly videoRepository: IVideoRepository,
  ) {}

  async getUserVideos(userId: string, limit: number, offset: number) {
    return this.videoRepository.getVideosByUserId(userId, limit, offset);
  }

  async getVideoById(id: string) {
    const video = await this.videoRepository.getVideoById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return { video };
  }

  async deleteVideo(userId: string, id: string) {
    const video = await this.videoRepository.getVideoById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    if (video.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this video');
    }
    await this.videoRepository.deleteVideo(id);
    return { message: 'Video deleted successfully' };
  }

  async getDownloadUrl(id: string) {
    const video = await this.videoRepository.getVideoById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return {
      downloadUrl: video.videoUrl || `https://mock-download.com/${id}.mp4`,
    };
  }
}


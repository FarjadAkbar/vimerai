import { Video, VideoKind, VideoStatus } from '@/domain/video.entity';
import type { IVideoRepository } from '@/core/ports/video.repository';

export class InMemoryVideoRepository implements IVideoRepository {
  private readonly videos = new Map<string, Video>();

  async createVideo(video: Video): Promise<void> {
    this.videos.set(video.id, video);
  }

  async getVideoById(id: string): Promise<Video | null> {
    return this.videos.get(id) ?? null;
  }

  async getVideoByJobId(jobId: string): Promise<Video | null> {
    return (
      [...this.videos.values()].find((video) => video.jobId === jobId) ?? null
    );
  }

  async getVideosByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ videos: Video[]; total: number }> {
    const all = [...this.videos.values()]
      .filter(
        (video) => video.userId === userId && video.kind === VideoKind.USER,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return {
      videos: all.slice(offset, offset + limit),
      total: all.length,
    };
  }

  async getTemplateVideosByUserId(userId: string): Promise<Video[]> {
    return [...this.videos.values()]
      .filter(
        (video) =>
          video.userId === userId && video.kind === VideoKind.TEMPLATE,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllTemplateVideos(): Promise<Video[]> {
    return [...this.videos.values()]
      .filter((video) => video.kind === VideoKind.TEMPLATE)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateVideo(video: Video): Promise<void> {
    this.videos.set(video.id, video);
  }

  async deleteVideo(id: string): Promise<void> {
    this.videos.delete(id);
  }

  seed(video: Video) {
    this.videos.set(video.id, video);
  }

  countByStatus(status: VideoStatus) {
    return [...this.videos.values()].filter((video) => video.status === status)
      .length;
  }
}

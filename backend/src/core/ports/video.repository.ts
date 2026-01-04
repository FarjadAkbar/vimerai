import { Video } from '@/domain/video.entity';

export interface IVideoRepository {
  createVideo(video: Video): Promise<void>;
  getVideoById(id: string): Promise<Video | null>;
  getVideoByJobId(jobId: string): Promise<Video | null>;
  getVideosByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ videos: Video[]; total: number }>;
  updateVideo(video: Video): Promise<void>;
  deleteVideo(id: string): Promise<void>;
}

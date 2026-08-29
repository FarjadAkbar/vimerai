import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IVideoRepository } from '@/core/ports/video.repository';
import {
  Video,
  VideoKind,
  VideoStatus,
} from '@/domain/video.entity';
import type { SaveBlitzEditDto } from './dto/save-blitz-edit.dto';

@Injectable()
export class VideosService {
  constructor(
    @Inject('IVideoRepository')
    private readonly videoRepository: IVideoRepository,
  ) {}

  async getUserVideos(userId: string, limit: number, offset: number) {
    return this.videoRepository.getVideosByUserId(userId, limit, offset);
  }

  async saveBlitzEdit(userId: string, dto: SaveBlitzEditDto) {
    const videoUrl = dto.videoUrl?.trim();
    if (!videoUrl) {
      throw new BadRequestException('videoUrl is required');
    }
    const hook = dto.hook?.trim();
    if (!hook) {
      throw new BadRequestException('hook is required');
    }

    const editPayload = {
      kind: 'blitz-edit' as const,
      hook,
      formatId: dto.formatId ?? null,
      audioUrl: dto.audioUrl ?? null,
      overlayUrl: dto.overlayUrl ?? null,
      volume: dto.volume ?? 1,
      textStyle: dto.textStyle ?? null,
      mentionBusiness: dto.mentionBusiness ?? false,
      sourceTemplateId: dto.sourceTemplateId ?? null,
    };

    const video = Video.createCompletedBlitzEdit(
      uuidv4(),
      userId,
      JSON.stringify(editPayload),
      `blitz-edit-${uuidv4()}`,
      videoUrl,
      {
        formatId: dto.formatId ?? null,
        previewUrl: videoUrl,
      },
    );
    await this.videoRepository.createVideo(video);
    return { video };
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
    if (video.kind === VideoKind.TEMPLATE) {
      throw new ForbiddenException('Shared templates cannot be deleted');
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

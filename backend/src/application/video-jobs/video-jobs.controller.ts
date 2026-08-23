import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateVideoJobDto } from '@/application/video-jobs/dto/create-video-job.dto';
import { VideoJobService } from '@/application/video-jobs/video-job.service';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@Controller('video-jobs')
@UseGuards(JwtAuthGuard)
export class VideoJobsController {
  constructor(private readonly videoJobService: VideoJobService) {}

  @Post('reference-videos')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadReferenceVideo(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Reference video file is required');
    }
    return this.videoJobService.uploadReferenceVideo(
      user.userId,
      file.buffer,
      file.mimetype,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: { userId: string },
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CreateVideoJobDto,
  ) {
    return this.videoJobService.createVideoJob(user.userId, {
      brandId: dto.brandId,
      productId: dto.productId,
      formatId: dto.formatId,
      reelPlatform: dto.reelPlatform,
      referenceVideoUrl: dto.referenceVideoUrl,
      productImageUrl: dto.productImageUrl,
      personImageUrl: dto.personImageUrl,
      instructions: dto.instructions,
    });
  }

  @Get()
  async list(@CurrentUser() user: { userId: string }) {
    return this.videoJobService.listVideoJobs(user.userId);
  }

  @Get(':id')
  async get(
    @CurrentUser() user: { userId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.videoJobService.getVideoJob(user.userId, id);
  }

  @Post(':id/regenerate')
  @HttpCode(HttpStatus.CREATED)
  async regenerate(
    @CurrentUser() user: { userId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.videoJobService.regenerateVideoJob(user.userId, id);
  }
}

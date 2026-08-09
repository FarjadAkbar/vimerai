import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateVideoJobDto } from '@/application/video-jobs/dto/create-video-job.dto';
import { VideoJobService } from '@/application/video-jobs/video-job.service';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@Controller('video-jobs')
@UseGuards(JwtAuthGuard)
export class VideoJobsController {
  constructor(private readonly videoJobService: VideoJobService) {}

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

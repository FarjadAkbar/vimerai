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
import { CreateImageJobDto } from '@/application/image-jobs/dto/create-image-job.dto';
import { ImageJobService } from '@/application/image-jobs/image-job.service';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@Controller('image-jobs')
@UseGuards(JwtAuthGuard)
export class ImageJobsController {
  constructor(private readonly imageJobService: ImageJobService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: { userId: string },
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CreateImageJobDto,
  ) {
    return this.imageJobService.createImageJob(user.userId, {
      prompt: dto.prompt,
      referenceImageUrls: dto.referenceImageUrls,
      negativePrompt: dto.negativePrompt,
    });
  }

  @Get()
  async list(@CurrentUser() user: { userId: string }) {
    return this.imageJobService.listImageJobs(user.userId);
  }

  @Get(':id')
  async get(
    @CurrentUser() user: { userId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.imageJobService.getImageJob(user.userId, id);
  }

  @Post(':id/regenerate')
  @HttpCode(HttpStatus.CREATED)
  async regenerate(
    @CurrentUser() user: { userId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.imageJobService.regenerateImageJob(user.userId, id);
  }
}

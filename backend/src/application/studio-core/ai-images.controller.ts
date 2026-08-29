import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AiImageService } from '@/application/studio-core/ai-image.service';
import { CreateAiImageDto } from '@/application/studio-core/dto/create-ai-image.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';

@Controller('ai-images')
@UseGuards(JwtAuthGuard)
export class AiImagesController {
  constructor(private readonly aiImageService: AiImageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async generate(
    @CurrentUser() user: { userId: string },
    @Body() body: CreateAiImageDto,
  ) {
    const item = await this.aiImageService.generateImage(user.userId, body);
    return { item };
  }

  @Get()
  async list(@CurrentUser() user: { userId: string }) {
    const items = await this.aiImageService.listImageJobs(user.userId);
    return { items };
  }

  @Get(':jobId')
  async get(
    @CurrentUser() user: { userId: string },
    @Param('jobId') jobId: string,
  ) {
    const item = await this.aiImageService.getImageJob(user.userId, jobId);
    return { item };
  }

  @Post(':jobId/regenerate')
  @HttpCode(HttpStatus.CREATED)
  async regenerate(
    @CurrentUser() user: { userId: string },
    @Param('jobId') jobId: string,
  ) {
    const item = await this.aiImageService.regenerateImage(user.userId, jobId);
    return { item };
  }
}

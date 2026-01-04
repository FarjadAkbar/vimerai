import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { GeneratorService } from './generator.service';
import { GenerateVideoDto } from './dto/generate-video.dto';
import { GeneratePreviewDto } from './dto/generate-preview.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';

@Controller('generator')
@UseGuards(JwtAuthGuard)
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generate(
    @CurrentUser() user: { userId: string },
    @Body(ValidationPipe) dto: GenerateVideoDto,
  ) {
    return this.generatorService.generateVideo(user.userId, dto);
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  async preview(
    @CurrentUser() user: { userId: string },
    @Body(ValidationPipe) dto: GeneratePreviewDto,
  ) {
    return this.generatorService.generatePreview(user.userId, dto);
  }

  @Get('status/:jobId')
  async getStatus(@Param('jobId') jobId: string) {
    return this.generatorService.getGenerationStatus(jobId);
  }

  @Get('download/:videoId')
  async downloadVideo(
    @Param('videoId') videoId: string,
    @Res() res: Response,
  ) {
    const videoBuffer = await this.generatorService.downloadVideo(videoId);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${videoId}.mp4"`);
    res.send(videoBuffer);
  }
}

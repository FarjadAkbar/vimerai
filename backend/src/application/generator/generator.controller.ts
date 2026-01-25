import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { GeneratorService } from './generator.service';
import { GenerateVideoDto } from './dto/generate-video.dto';
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
    @Query('type') type: string,
    @Body(ValidationPipe) dto: GenerateVideoDto,
  ) {
    if (type !== 'preview' && type !== 'full') {
      throw new BadRequestException(
        "Query parameter 'type' must be either 'preview' or 'full'",
      );
    }
    return this.generatorService.generateVideo(
      user.userId,
      dto,
      type as 'preview' | 'full',
    );
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

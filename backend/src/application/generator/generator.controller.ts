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
} from '@nestjs/common';
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
}

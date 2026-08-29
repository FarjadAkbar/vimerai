import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TemplateGenerationService } from '@/application/studio-core/template-generation.service';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(
    private readonly templateGenerationService: TemplateGenerationService,
  ) {}

  @Get('blitz')
  async listBlitzTemplates() {
    return this.templateGenerationService.listBlitzTemplates();
  }

  @Post('blitz/samples')
  @HttpCode(HttpStatus.CREATED)
  async generateBlitzSamples() {
    return this.templateGenerationService.generateBlitzSamples();
  }

  @Get('viral-remix')
  async listViralRemixTemplates() {
    return this.templateGenerationService.listViralRemixTemplates();
  }

  @Post('viral-remix/samples')
  @HttpCode(HttpStatus.CREATED)
  async generateViralRemixSamples() {
    return this.templateGenerationService.generateViralRemixSamples();
  }
}

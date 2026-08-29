import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { TemplateGenerationService } from '@/application/studio-core/template-generation.service';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { SaveBlitzEditDto } from './dto/save-blitz-edit.dto';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly templateGenerationService: TemplateGenerationService,
  ) {}

  @Get()
  async getVideos(
    @CurrentUser() user: { userId: string },
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
  ) {
    return this.videosService.getUserVideos(user.userId, limit, offset);
  }

  @Get('templates')
  async getTemplates() {
    return this.templateGenerationService.listBlitzTemplates();
  }

  @Post('templates/samples')
  @HttpCode(HttpStatus.CREATED)
  async generateSampleTemplates() {
    return this.templateGenerationService.generateBlitzSamples();
  }

  @Get('viral-remix-templates')
  async getViralRemixTemplates() {
    return this.templateGenerationService.listViralRemixTemplates();
  }

  @Post('viral-remix-templates/samples')
  @HttpCode(HttpStatus.CREATED)
  async generateViralRemixSampleTemplates() {
    return this.templateGenerationService.generateViralRemixSamples();
  }

  @Post('blitz-edits')
  @HttpCode(HttpStatus.CREATED)
  async saveBlitzEdit(
    @CurrentUser() user: { userId: string },
    @Body() dto: SaveBlitzEditDto,
  ) {
    return this.videosService.saveBlitzEdit(user.userId, dto);
  }

  @Get(':id')
  async getVideo(@Param('id') id: string) {
    return this.videosService.getVideoById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteVideo(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.videosService.deleteVideo(user.userId, id);
  }

  @Get(':id/download')
  async downloadVideo(@Param('id') id: string) {
    return this.videosService.getDownloadUrl(id);
  }
}

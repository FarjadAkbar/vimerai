import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  async getVideos(
    @CurrentUser() user: { userId: string },
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
  ) {
    return this.videosService.getUserVideos(user.userId, limit, offset);
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

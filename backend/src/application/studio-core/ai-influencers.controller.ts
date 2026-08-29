import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AiInfluencerService } from '@/application/studio-core/ai-influencer.service';
import { toAiInfluencerResponse } from '@/application/studio-core/ai-influencer-response';
import { CreateInfluencerImageDto } from '@/application/studio-core/dto/create-influencer-image.dto';
import { CreateInfluencerVideoDto } from '@/application/studio-core/dto/create-influencer-video.dto';
import { InfluencerImageService } from '@/application/studio-core/influencer-image.service';
import { InfluencerVideoService } from '@/application/studio-core/influencer-video.service';
import { CreateAiInfluencerDto } from '@/application/studio-core/dto/create-ai-influencer.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';

@Controller('ai-influencers')
@UseGuards(JwtAuthGuard)
export class AiInfluencersController {
  constructor(
    private readonly aiInfluencerService: AiInfluencerService,
    private readonly influencerImageService: InfluencerImageService,
    private readonly influencerVideoService: InfluencerVideoService,
  ) {}

  @Get()
  async listInfluencers(@CurrentUser() user: { userId: string }) {
    const influencers = await this.aiInfluencerService.listInfluencers(
      user.userId,
    );
    return {
      influencers: influencers.map(toAiInfluencerResponse),
    };
  }

  @Get(':id/images')
  async listInfluencerImages(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    const items = await this.influencerImageService.listInfluencerImages(
      user.userId,
      id,
    );
    return { items };
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.CREATED)
  async generateInfluencerImage(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: CreateInfluencerImageDto,
  ) {
    const item = await this.influencerImageService.generateImage(
      user.userId,
      id,
      body,
    );
    return { item };
  }

  @Post(':id/images/:contentItemId/animate')
  @HttpCode(HttpStatus.CREATED)
  async animateInfluencerImage(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Param('contentItemId') contentItemId: string,
  ) {
    const item = await this.influencerImageService.animateImage(
      user.userId,
      id,
      contentItemId,
    );
    return { item };
  }

  @Get(':id/videos')
  async listInfluencerVideos(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    const items = await this.influencerVideoService.listInfluencerVideos(
      user.userId,
      id,
    );
    return { items };
  }

  @Post(':id/videos')
  @HttpCode(HttpStatus.CREATED)
  async generateInfluencerVideo(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: CreateInfluencerVideoDto,
  ) {
    const item = await this.influencerVideoService.generateVideo(
      user.userId,
      id,
      body,
    );
    return { item };
  }

  @Get(':id')
  async getInfluencer(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    const influencer = await this.aiInfluencerService.getInfluencer(
      user.userId,
      id,
    );
    return { influencer: toAiInfluencerResponse(influencer) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createInfluencer(
    @CurrentUser() user: { userId: string },
    @Body() body: CreateAiInfluencerDto,
  ) {
    const influencer = await this.aiInfluencerService.createInfluencer(
      user.userId,
      body,
    );
    return { influencer: toAiInfluencerResponse(influencer) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInfluencer(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    await this.aiInfluencerService.deleteInfluencer(user.userId, id);
  }
}

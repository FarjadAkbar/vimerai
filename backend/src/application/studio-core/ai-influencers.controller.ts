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
import { CreateAiInfluencerDto } from '@/application/studio-core/dto/create-ai-influencer.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';

@Controller('ai-influencers')
@UseGuards(JwtAuthGuard)
export class AiInfluencersController {
  constructor(private readonly aiInfluencerService: AiInfluencerService) {}

  @Get()
  async listInfluencers(@CurrentUser() user: { userId: string }) {
    const influencers = await this.aiInfluencerService.listInfluencers(
      user.userId,
    );
    return {
      influencers: influencers.map(toAiInfluencerResponse),
    };
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

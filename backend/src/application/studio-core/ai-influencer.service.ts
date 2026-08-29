import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IAiInfluencerRepository } from '@/core/ports/ai-influencer.repository';
import type {
  CreateAiInfluencerInput,
  IAiInfluencerService,
} from '@/core/ports/ai-influencer.service';
import type { IMediaAssetService } from '@/core/ports/media-asset.service';
import {
  AI_INFLUENCER_REPOSITORY_TOKEN,
  MEDIA_ASSET_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import {
  AiInfluencer,
  PortraitSource,
} from '@/domain/ai-influencer.entity';
import { MediaAssetKind } from '@/domain/media-asset.entity';

@Injectable()
export class AiInfluencerService implements IAiInfluencerService {
  constructor(
    @Inject(AI_INFLUENCER_REPOSITORY_TOKEN)
    private readonly influencerRepository: IAiInfluencerRepository,
    @Inject(MEDIA_ASSET_SERVICE_TOKEN)
    private readonly mediaAssetService: IMediaAssetService,
  ) {}

  async listInfluencers(userId: string): Promise<AiInfluencer[]> {
    return this.influencerRepository.findByUserId(userId);
  }

  async getInfluencer(userId: string, id: string): Promise<AiInfluencer> {
    const influencer = await this.influencerRepository.findById(id);
    if (!influencer || influencer.userId !== userId) {
      throw new NotFoundException('Influencer not found');
    }
    return influencer;
  }

  async createInfluencer(
    userId: string,
    input: CreateAiInfluencerInput,
  ): Promise<AiInfluencer> {
    const name = input.name.trim();
    const appearancePrompt = input.appearancePrompt.trim();
    if (!name) {
      throw new BadRequestException('Influencer name is required');
    }
    if (!appearancePrompt) {
      throw new BadRequestException('Appearance prompt is required');
    }

    let portraitUrl = input.portraitUrl?.trim() ?? null;
    let portraitMediaAssetId = input.portraitMediaAssetId ?? null;

    if (input.portraitSource === PortraitSource.UPLOAD) {
      if (!portraitMediaAssetId) {
        throw new BadRequestException(
          'Portrait media asset is required for uploaded portraits',
        );
      }
      const asset = await this.mediaAssetService.getMediaAsset(
        userId,
        portraitMediaAssetId,
      );
      if (asset.kind !== MediaAssetKind.IMAGE) {
        throw new BadRequestException('Portrait must be an image media asset');
      }
      portraitUrl = asset.url;
    } else if (!portraitUrl) {
      throw new BadRequestException('Portrait URL is required for AI portraits');
    } else {
      portraitMediaAssetId = null;
    }

    const influencer = AiInfluencer.create({
      id: uuidv4(),
      userId,
      name,
      gender: input.gender,
      age: input.age,
      ethnicity: input.ethnicity?.trim() || null,
      appearancePrompt,
      portraitSource: input.portraitSource,
      portraitMediaAssetId,
      portraitUrl,
    });

    await this.influencerRepository.create(influencer);
    return influencer;
  }

  async deleteInfluencer(userId: string, id: string): Promise<void> {
    await this.getInfluencer(userId, id);
    await this.influencerRepository.delete(id);
  }
}

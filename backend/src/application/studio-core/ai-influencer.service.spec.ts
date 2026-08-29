import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AiInfluencerService } from '@/application/studio-core/ai-influencer.service';
import {
  InfluencerGender,
  PortraitSource,
} from '@/domain/ai-influencer.entity';
import { MediaAssetKind } from '@/domain/media-asset.entity';
import { MediaAssetService } from '@/application/studio-core/media-asset.service';
import { InMemoryAiInfluencerRepository } from '@/testing/fakes/in-memory-ai-influencer.repository';
import { InMemoryMediaAssetRepository } from '@/testing/fakes/in-memory-media-asset.repository';
import type { IStorageService } from '@/core/ports/storage.service';

function storageFake(): IStorageService {
  return {
    upload: async (key) => `https://cdn.example.com/${key}`,
    delete: async () => undefined,
    getUrl: (key) => `https://cdn.example.com/${key}`,
  };
}

describe('AiInfluencerService', () => {
  function createService() {
    const influencerRepo = new InMemoryAiInfluencerRepository();
    const mediaAssetRepo = new InMemoryMediaAssetRepository();
    const mediaAssetService = new MediaAssetService(
      mediaAssetRepo,
      storageFake(),
    );
    const service = new AiInfluencerService(influencerRepo, mediaAssetService);
    return { service, mediaAssetService };
  }

  it('creates an influencer with an uploaded portrait media asset', async () => {
    const { service, mediaAssetService } = createService();
    const asset = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.IMAGE,
      name: 'portrait.jpg',
      url: 'https://cdn.example.com/portrait.jpg',
    });

    const influencer = await service.createInfluencer('user-1', {
      name: 'Ava Lane',
      gender: InfluencerGender.FEMALE,
      age: 28,
      ethnicity: 'East Asian',
      appearancePrompt: 'Soft studio light, natural makeup.',
      portraitSource: PortraitSource.UPLOAD,
      portraitMediaAssetId: asset.id,
    });

    expect(influencer.name).toBe('Ava Lane');
    expect(influencer.portraitMediaAssetId).toBe(asset.id);
    expect(influencer.portraitUrl).toBe('https://cdn.example.com/portrait.jpg');
    expect(await service.listInfluencers('user-1')).toHaveLength(1);
  });

  it('creates an influencer with an AI-generated portrait URL', async () => {
    const { service } = createService();

    const influencer = await service.createInfluencer('user-1', {
      name: 'Jordan Lee',
      gender: InfluencerGender.MALE,
      age: 32,
      appearancePrompt: 'Confident streetwear styling.',
      portraitSource: PortraitSource.AI,
      portraitUrl: 'https://cdn.example.com/generated.jpg',
    });

    expect(influencer.portraitSource).toBe(PortraitSource.AI);
    expect(influencer.portraitMediaAssetId).toBeNull();
    expect(influencer.portraitUrl).toBe('https://cdn.example.com/generated.jpg');
  });

  it('rejects upload portraits without a media asset id', async () => {
    const { service } = createService();

    await expect(
      service.createInfluencer('user-1', {
        name: 'Ava Lane',
        gender: InfluencerGender.FEMALE,
        age: 28,
        appearancePrompt: 'Soft studio light.',
        portraitSource: PortraitSource.UPLOAD,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects portraits that reference another users media asset', async () => {
    const { service, mediaAssetService } = createService();
    const asset = await mediaAssetService.createMediaAsset('user-2', {
      kind: MediaAssetKind.IMAGE,
      name: 'portrait.jpg',
      url: 'https://cdn.example.com/portrait.jpg',
    });

    await expect(
      service.createInfluencer('user-1', {
        name: 'Ava Lane',
        gender: InfluencerGender.FEMALE,
        age: 28,
        appearancePrompt: 'Soft studio light.',
        portraitSource: PortraitSource.UPLOAD,
        portraitMediaAssetId: asset.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes an influencer owned by the user', async () => {
    const { service } = createService();
    const influencer = await service.createInfluencer('user-1', {
      name: 'Jordan Lee',
      gender: InfluencerGender.MALE,
      age: 32,
      appearancePrompt: 'Confident streetwear styling.',
      portraitSource: PortraitSource.AI,
      portraitUrl: 'https://cdn.example.com/generated.jpg',
    });

    await service.deleteInfluencer('user-1', influencer.id);
    expect(await service.listInfluencers('user-1')).toHaveLength(0);
  });
});

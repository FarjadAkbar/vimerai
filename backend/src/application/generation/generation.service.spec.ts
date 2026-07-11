import { NotImplementedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GenerationService } from '@/application/generation/generation.service';
import type { IGenerationService } from '@/core/ports/generation.service';
import type { IVideoGenerationProvider } from '@/core/ports/video-generation.provider';
import {
  GENERATION_SERVICE_TOKEN,
  IMAGE_GENERATION_PROVIDER_TOKEN,
  TEXT_GENERATION_PROVIDER_TOKEN,
  VIDEO_GENERATION_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import { FakeImageGenerationProvider } from '@/testing/fakes/fake-image-generation.provider';
import { FakeTextGenerationProvider } from '@/testing/fakes/fake-text-generation.provider';

describe('GenerationService (DI seam)', () => {
  let generationService: IGenerationService;

  beforeEach(async () => {
    const videoFake: IVideoGenerationProvider = {
      generateVideo: async () => ({
        jobId: 'job-1',
        status: 'pending',
      }),
      getGenerationStatus: async () => ({
        jobId: 'job-1',
        status: 'pending',
      }),
      generatePreview: async () => ({
        jobId: 'job-1',
        status: 'pending',
      }),
      downloadVideo: async () => Buffer.from(''),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerationService,
        {
          provide: GENERATION_SERVICE_TOKEN,
          useExisting: GenerationService,
        },
        {
          provide: TEXT_GENERATION_PROVIDER_TOKEN,
          useValue: new FakeTextGenerationProvider({
            'creative-brief': '{}',
          }),
        },
        {
          provide: IMAGE_GENERATION_PROVIDER_TOKEN,
          useValue: new FakeImageGenerationProvider(
            'https://cdn.example.com/img.jpg',
          ),
        },
        {
          provide: VIDEO_GENERATION_PROVIDER_TOKEN,
          useValue: videoFake,
        },
      ],
    }).compile();

    generationService = module.get<IGenerationService>(GENERATION_SERVICE_TOKEN);
  });

  it('resolves IGenerationService with modality provider fakes', () => {
    expect(generationService).toBeDefined();
  });

  it('createGeneration is reserved for a later ticket', async () => {
    await expect(
      generationService.createGeneration('user-1', {
        productId: 'product-1',
        goal: 'increase_sales',
      }),
    ).rejects.toBeInstanceOf(NotImplementedException);
  });
});

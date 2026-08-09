import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FalImageGenerationProvider } from '@/infrastructure/ai/fal-image-generation.provider';
import type { ImageGenerationRequest } from '@/types/generation/image-generation';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function createConfigService(
  fal?: {
    apiKey: string;
    baseUrl: string;
    model: string;
    timeout: number;
  } | null,
): ConfigService {
  return {
    get: (key: string) => {
      if (key === 'imageGeneration.fal') {
        return fal === null
          ? undefined
          : (fal ?? {
              apiKey: 'test-fal-key',
              baseUrl: 'https://queue.fal.run/fal-ai/',
              model: 'flux-pro/kontext',
              timeout: 30_000,
            });
      }
      return undefined;
    },
  } as ConfigService;
}

const request: ImageGenerationRequest = {
  prompt: 'Luxury serum on marble, Instagram feed still',
  productImageUrls: [
    'https://cdn.example.com/product-a.jpg',
    'https://cdn.example.com/product-b.jpg',
  ],
  negativePrompt: 'clutter, watermark',
};

describe('FalImageGenerationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.isAxiosError = jest.fn().mockReturnValue(false) as never;
  });

  it('returns a Post image URL for a product-conditioned request', async () => {
    const provider = new FalImageGenerationProvider(createConfigService());

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        request_id: 'req-123',
        status_url:
          'https://queue.fal.run/fal-ai/flux-pro/kontext/requests/req-123/status',
        response_url:
          'https://queue.fal.run/fal-ai/flux-pro/kontext/requests/req-123',
      },
    });
    mockedAxios.get
      .mockResolvedValueOnce({
        status: 200,
        data: { status: 'COMPLETED' },
      })
      .mockResolvedValueOnce({
        data: {
          images: [
            {
              url: 'https://fal.media/files/generated-post.jpg',
            },
          ],
        },
      });

    const result = await provider.generateImage(request);

    expect(result.imageUrl).toBe(
      'https://fal.media/files/generated-post.jpg',
    );
  });

  it('submits the first Product image as fal image_url with Key auth', async () => {
    const provider = new FalImageGenerationProvider(createConfigService());

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        request_id: 'req-456',
        status_url:
          'https://queue.fal.run/fal-ai/flux-pro/kontext/requests/req-456/status',
        response_url:
          'https://queue.fal.run/fal-ai/flux-pro/kontext/requests/req-456',
      },
    });
    mockedAxios.get
      .mockResolvedValueOnce({
        status: 200,
        data: { status: 'COMPLETED' },
      })
      .mockResolvedValueOnce({
        data: {
          images: [{ url: 'https://fal.media/files/out.jpg' }],
        },
      });

    await provider.generateImage(request);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://queue.fal.run/fal-ai/flux-pro/kontext',
      expect.objectContaining({
        prompt: expect.stringContaining(
          'Luxury serum on marble, Instagram feed still',
        ),
        image_url: 'https://cdn.example.com/product-a.jpg',
        aspect_ratio: '1:1',
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Key test-fal-key',
          'Content-Type': 'application/json',
        }),
      }),
    );
    expect(mockedAxios.post.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        prompt: expect.stringContaining('Avoid: clutter, watermark'),
      }),
    );
  });

  it('requires Product image conditioning URLs', async () => {
    const provider = new FalImageGenerationProvider(createConfigService());

    await expect(
      provider.generateImage({
        prompt: 'feed still',
        productImageUrls: [],
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('fails when FAL_KEY is missing', () => {
    expect(
      () =>
        new FalImageGenerationProvider(
          createConfigService({
            apiKey: '',
            baseUrl: 'https://queue.fal.run/fal-ai/',
            model: 'flux-pro/kontext',
            timeout: 30_000,
          }),
        ),
    ).toThrow('FAL_KEY is missing');
  });
});

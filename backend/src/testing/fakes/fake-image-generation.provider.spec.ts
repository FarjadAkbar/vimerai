import { FakeImageGenerationProvider } from '@/testing/fakes/fake-image-generation.provider';
import type { ImageGenerationRequest } from '@/types/generation/image-generation';

describe('FakeImageGenerationProvider', () => {
  it('returns a Post image URL for a conditioned request', async () => {
    const provider = new FakeImageGenerationProvider(
      'https://cdn.example.com/ai-post.jpg',
    );

    const request: ImageGenerationRequest = {
      prompt: 'Luxury serum on marble',
      productImageUrls: ['https://cdn.example.com/product.jpg'],
    };

    const result = await provider.generateImage(request);

    expect(result.imageUrl).toBe('https://cdn.example.com/ai-post.jpg');
  });
});

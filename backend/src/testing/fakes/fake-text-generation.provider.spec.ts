import { FakeTextGenerationProvider } from '@/testing/fakes/fake-text-generation.provider';
import type { TextGenerationRequest } from '@/types/generation/text-generation';

describe('FakeTextGenerationProvider', () => {
  it('returns structured text for a layered Creative Brief request', async () => {
    const provider = new FakeTextGenerationProvider({
      'creative-brief': JSON.stringify({
        hook: 'Stop scrolling',
        attention: 'See the glow',
        productDisplay: 'Bottle hero',
        viewerConnection: 'Made for you',
        cta: 'Shop now',
      }),
    });

    const request: TextGenerationRequest = {
      artifact: 'creative-brief',
      layers: {
        qualityAndSafety: 'Be human, benefit-led.',
        brandKit: 'Tone: Luxury. Avoid: slang.',
        product: 'Serum, hydrating.',
        goalAndOptions: 'Goal: Increase sales. Length: Teaser.',
        outputSchema: 'Return Creative Brief JSON.',
      },
    };

    const result = await provider.generateText(request);

    expect(result.artifact).toBe('creative-brief');
    expect(result.text).toContain('Stop scrolling');
    expect(result.text).toContain('Shop now');
  });
});

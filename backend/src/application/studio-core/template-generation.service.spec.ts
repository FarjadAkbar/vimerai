import { TemplateGenerationService } from '@/application/studio-core/template-generation.service';
import { GenerationMode, Video, VideoKind, VideoStatus } from '@/domain/video.entity';
import { FakeVideoGenerationProvider } from '@/testing/fakes/fake-video-generation.provider';
import { InMemoryTemplateRepository } from '@/testing/fakes/in-memory-template.repository';
import { TemplateStatus, TemplateType } from '@/domain/template.entity';

describe('TemplateGenerationService', () => {
  it('submits one Blitz template per format without blocking on fal', async () => {
    const repo = new InMemoryTemplateRepository();
    const provider = new FakeVideoGenerationProvider(
      'https://cdn.example.com/sample.mp4',
    );
    const service = new TemplateGenerationService(repo, provider);

    const result = await service.generateBlitzSamples();

    expect(result.createdCount).toBe(4);
    expect(result.templates).toHaveLength(4);
    expect(
      result.templates.every((template) => template.type === TemplateType.BLITZ),
    ).toBe(true);
    expect(
      result.templates.every(
        (template) => template.status === TemplateStatus.COMPLETED,
      ),
    ).toBe(true);
    expect(result.templates.map((template) => template.slug).sort()).toEqual([
      'green-screen',
      'hook-demo',
      'slideshow',
      'wall-of-text',
    ]);
    expect(provider.generateCalls).toHaveLength(4);
    expect(provider.generateCalls[0].mode).toBe(GenerationMode.FAST);
  });

  it('skips slugs that already have a completed or in-flight template', async () => {
    const repo = new InMemoryTemplateRepository();
    const provider = new FakeVideoGenerationProvider(
      'https://cdn.example.com/sample.mp4',
    );
    const service = new TemplateGenerationService(repo, provider);

    await service.generateBlitzSamples();
    provider.generateCalls.length = 0;

    const second = await service.generateBlitzSamples();

    expect(second.createdCount).toBe(0);
    expect(provider.generateCalls).toHaveLength(0);
    expect(second.templates).toHaveLength(4);
  });

  it('lists shared Blitz templates to every caller', async () => {
    const repo = new InMemoryTemplateRepository();
    const provider = new FakeVideoGenerationProvider(
      'https://cdn.example.com/sample.mp4',
    );
    const service = new TemplateGenerationService(repo, provider);

    await service.generateBlitzSamples();
    const forUserA = await service.listBlitzTemplates();
    const forUserB = await service.listBlitzTemplates();

    expect(forUserA.templates).toHaveLength(4);
    expect(forUserB.templates).toHaveLength(4);
  });

  it('refreshes processing Blitz templates when listing', async () => {
    const repo = new InMemoryTemplateRepository();
    const provider = new FakeVideoGenerationProvider(
      'https://cdn.example.com/sample.mp4',
    );
    provider.completeOnGenerate = false;
    const service = new TemplateGenerationService(repo, provider);

    const created = await service.generateBlitzSamples();
    expect(
      created.templates.every(
        (template) => template.status === TemplateStatus.PROCESSING,
      ),
    ).toBe(true);

    const listed = await service.listBlitzTemplates();
    expect(
      listed.templates.every(
        (template) => template.status === TemplateStatus.COMPLETED,
      ),
    ).toBe(true);
    expect(
      listed.templates.every((template) => Boolean(template.videoUrl)),
    ).toBe(true);
  });

  it('generates Viral Remix templates separately from Blitz', async () => {
    const repo = new InMemoryTemplateRepository();
    const provider = new FakeVideoGenerationProvider(
      'https://cdn.example.com/viral.mp4',
    );
    const service = new TemplateGenerationService(repo, provider);

    await service.generateBlitzSamples();
    const viral = await service.generateViralRemixSamples();

    expect(viral.createdCount).toBe(12);
    expect(viral.templates).toHaveLength(12);
    expect(
      viral.templates.every((template) => template.slug.startsWith('vr-')),
    ).toBe(true);

    const blitz = await service.listBlitzTemplates();
    const listedViral = await service.listViralRemixTemplates();
    expect(blitz.templates).toHaveLength(4);
    expect(listedViral.templates).toHaveLength(12);
  });
});

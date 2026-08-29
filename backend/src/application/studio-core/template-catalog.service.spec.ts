import { TemplateCatalogService } from '@/application/studio-core/template-catalog.service';
import {
  BlitzContentType,
  Template,
  TemplateType,
} from '@/domain/template.entity';
import { InMemoryTemplateRepository } from '@/testing/fakes/in-memory-template.repository';

describe('TemplateCatalogService', () => {
  it('lists blitz templates filtered by content type', async () => {
    const repo = new InMemoryTemplateRepository();
    const service = new TemplateCatalogService(repo);

    await repo.create(
      Template.create({
        id: 't1',
        slug: 'slideshow',
        type: TemplateType.BLITZ,
        label: 'Slideshow',
        prompt: 'prompt',
        contentType: BlitzContentType.SLIDESHOW,
      }),
    );
    await repo.create(
      Template.create({
        id: 't2',
        slug: 'wall-of-text',
        type: TemplateType.BLITZ,
        label: 'Wall of Text',
        prompt: 'prompt',
        contentType: BlitzContentType.WALL_OF_TEXT,
      }),
    );

    const slideshowOnly = await service.listTemplates(TemplateType.BLITZ, {
      contentType: BlitzContentType.SLIDESHOW,
    });

    expect(slideshowOnly).toHaveLength(1);
    expect(slideshowOnly[0].slug).toBe('slideshow');
  });

  it('upserts a template by slug without duplicating', async () => {
    const repo = new InMemoryTemplateRepository();
    const service = new TemplateCatalogService(repo);

    const first = await service.upsertTemplate({
      slug: 'vr-cold-open',
      type: TemplateType.VIRAL_REMIX,
      label: 'Cold-open hook',
      prompt: 'prompt',
      durationLabel: '6s',
      remixFormatId: 'hook-reveal',
    });
    const second = await service.upsertTemplate({
      slug: 'vr-cold-open',
      type: TemplateType.VIRAL_REMIX,
      label: 'Different label',
      prompt: 'other',
    });

    expect(second.id).toBe(first.id);
    expect(await service.listTemplates(TemplateType.VIRAL_REMIX)).toHaveLength(
      1,
    );
  });
});

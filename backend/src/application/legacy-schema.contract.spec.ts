/**
 * Ticket 13 — legacy schema/API contract close.
 * Studio-core Job + ContentItem + Template catalog + MediaAsset is the long-term model.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { join } from 'node:path';

describe('Legacy schema contract (ticket 13)', () => {
  const backendSrc = join(__dirname, '..');

  function read(...segments: string[]) {
    return fs.readFileSync(path.join(backendSrc, ...segments), 'utf8');
  }

  it('does not wire legacy modality job or generation modules in AppModule', () => {
    const appModule = read('app.module.ts');
    expect(appModule).not.toMatch(/\bGenerationModule\b/);
    expect(appModule).not.toMatch(/\bProductsModule\b/);
    expect(appModule).not.toMatch(/\bPostJobsModule\b/);
    expect(appModule).not.toMatch(/\bVideoJobsModule\b/);
    expect(appModule).not.toMatch(/\bImageJobsModule\b/);
    expect(appModule).not.toMatch(/\bVideosModule\b/);
  });

  it('exposes templates via studio-core catalog, not videos table routes', () => {
    const studioCoreModule = read(
      'application',
      'studio-core',
      'studio-core.module.ts',
    );
    expect(studioCoreModule).toMatch(/TemplatesController/);
    expect(studioCoreModule).not.toMatch(/VideosController/);
  });

  it('registers studio-core create surfaces for Job-based flows', () => {
    const studioCoreModule = read(
      'application',
      'studio-core',
      'studio-core.module.ts',
    );
    expect(studioCoreModule).toMatch(/ViralRemixController/);
    expect(studioCoreModule).toMatch(/BlitzComposeController/);
    expect(studioCoreModule).toMatch(/AiImagesController/);
    expect(studioCoreModule).toMatch(/ContentLibraryController/);
    expect(studioCoreModule).toMatch(/AiInfluencersController/);
  });

  it('does not register Product entity or brand_kit_products persistence', () => {
    const databaseModule = read(
      'infrastructure',
      'persistence',
      'database.module.ts',
    );
    const dataSource = fs.readFileSync(
      path.join(backendSrc, '..', 'data-source.ts'),
      'utf8',
    );
    const migrationsDir = path.join(
      backendSrc,
      'infrastructure',
      'persistence',
      'migrations',
    );

    expect(databaseModule).not.toMatch(/\bProductEntity\b/);
    expect(dataSource).not.toMatch(/\bProductEntity\b/);
    expect(
      fs.existsSync(
        path.join(
          backendSrc,
          'infrastructure',
          'persistence',
          'typeorm',
          'entities',
          'product.entity.ts',
        ),
      ),
    ).toBe(false);
    expect(
      fs.readdirSync(migrationsDir).some((file) =>
        /DropBrandKitProducts/.test(file),
      ),
    ).toBe(true);
  });
});

import { CuratedFormatCatalog } from '@/infrastructure/formats/curated-format.catalog';

describe('CuratedFormatCatalog', () => {
  const catalog = new CuratedFormatCatalog();

  it('lists only Formats tagged post or both for Make a Post', () => {
    const formats = catalog.listByModality('post');

    expect(formats.length).toBeGreaterThan(0);
    expect(formats.every((f) => f.modality === 'post' || f.modality === 'both')).toBe(
      true,
    );
    expect(formats.some((f) => f.modality === 'video')).toBe(false);
    expect(formats.map((f) => f.id)).toEqual(
      expect.arrayContaining(['listicle-hook', 'problem-solution', 'meme-cta']),
    );
  });

  it('lists only Formats tagged video or both for Make a Video', () => {
    const formats = catalog.listByModality('video');

    expect(formats.length).toBeGreaterThan(0);
    expect(
      formats.every((f) => f.modality === 'video' || f.modality === 'both'),
    ).toBe(true);
    expect(formats.some((f) => f.modality === 'post')).toBe(false);
  });

  it('returns a Format by id', () => {
    const format = catalog.getById('listicle-hook');
    expect(format?.label).toBe('Listicle hook');
    expect(format?.promptStructure.length).toBeGreaterThan(0);
  });

  it('returns null for unknown Format id', () => {
    expect(catalog.getById('not-a-format')).toBeNull();
  });
});

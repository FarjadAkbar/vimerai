import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Ticket 05 — primary product path is Fetra create (Brand Studio), not
 * multi-arm Generation / Brand Kit–gated Generate.
 *
 * Seam: filesystem contract over primary UX entry points (home, header,
 * studio shell, auth redirects), matching phase1-product-path.contract.spec.ts.
 */
describe('Fetra product path contract (ticket 05)', () => {
  const repoRoot = path.join(__dirname, '..', '..', '..');
  const frontendSrc = path.join(repoRoot, 'frontend', 'src');

  const read = (...segments: string[]) =>
    fs.readFileSync(path.join(frontendSrc, ...segments), 'utf8');

  it('defines primary create routes on Brand Studio, not Generation', () => {
    const source = read('lib', 'product-path.ts');

    expect(source).toMatch(/posts:\s*["']\/studio\/posts["']/);
    expect(source).toMatch(/videos:\s*["']\/studio\/videos["']/);
    expect(source).toMatch(/businessDna:\s*["']\/studio\/business-dna["']/);
    expect(source).toMatch(/LEGACY_GENERATION_PRIMARY\s*=\s*false/);
    expect(source).not.toMatch(/\/generations/);
  });

  it('home defaults to Fetra create path; BrandGeneration only behind legacy flag', () => {
    const productPath = read('lib', 'product-path.ts');
    const source = read('app', 'page.tsx');

    expect(productPath).toMatch(/LEGACY_GENERATION_PRIMARY\s*=\s*false/);
    expect(source).toMatch(/LEGACY_GENERATION_PRIMARY/);
    expect(source).toMatch(/if \(LEGACY_GENERATION_PRIMARY\)/);
    expect(source).not.toMatch(/useCreateGeneration/);
    expect(source).not.toMatch(/\/generations/);
    expect(source).toMatch(/PRODUCT_PATH/);
  });

  it('home copy leads to Brand Studio create path, not multi-arm Generation', () => {
    const source = read('app', 'page.tsx');

    expect(source).toMatch(/Brand Studio/);
    expect(source).toMatch(/Make a Post/);
    expect(source).toMatch(/Make a Video/);
    expect(source).toMatch(/Business DNA/);
    expect(source).not.toMatch(/Reel Storyboard/);
    expect(source).not.toMatch(/posts_only|multi_arm/);
  });

  it('primary header nav links to Fetra paths, not Generation library', () => {
    const source = read('components', 'header.tsx');

    expect(source).toMatch(/PRODUCT_PATH/);
    expect(source).toMatch(/Make a Post/);
    expect(source).toMatch(/Make a Video/);
    expect(source).toMatch(/Business DNA/);
    expect(source).toMatch(/Brand Studio/);
    expect(source).not.toMatch(/\/generations/);
    expect(source).not.toMatch(/>\s*Generator\s*</);
    expect(source).not.toMatch(/New Generation/);
  });

  it('studio sidebar exposes Make a Post / Make a Video / Business DNA without Generation', () => {
    const source = read('components', 'studio', 'studio-sidebar.tsx');

    expect(source).toMatch(/PRODUCT_PATH\.posts/);
    expect(source).toMatch(/PRODUCT_PATH\.videos/);
    expect(source).toMatch(/PRODUCT_PATH\.businessDna/);
    expect(source).toMatch(/Make a Post/);
    expect(source).toMatch(/Make a Video/);
    expect(source).toMatch(/Business DNA/);
    expect(source).not.toMatch(/\/generations/);
    expect(source).not.toMatch(/Generation/);
  });

  it('login and signup land in Brand Studio, not Generation home', () => {
    const source = read('lib', 'hooks', 'use-auth.ts');

    expect(source).toMatch(/PRODUCT_PATH\.studio/);
    expect(source).toMatch(/router\.push\(PRODUCT_PATH\.studio\)/);
    expect(source).not.toMatch(
      /Redirect to generator as per Phase 1 requirements/,
    );
  });

  it('legacy Generation library is demoted away from primary create CTA', () => {
    const source = read('app', 'generations', 'page.tsx');

    expect(source).not.toMatch(/href=["']\/["']/);
    expect(source).toMatch(/PRODUCT_PATH\.(studio|posts|videos)/);
    expect(source).toMatch(/Brand Studio/);
    expect(source).toMatch(/Legacy/);
  });
});

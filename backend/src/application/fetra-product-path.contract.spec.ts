import * as fs from 'node:fs';

import * as path from 'node:path';



/**

 * Ticket 05 + 13 — primary product path is Fetra create (Brand Studio), not

 * multi-arm Generation / legacy modality jobs.

 */

describe('Fetra product path contract (ticket 05 / 13)', () => {

  const repoRoot = path.join(__dirname, '..', '..', '..');

  const frontendSrc = path.join(repoRoot, 'frontend', 'src');



  const read = (...segments: string[]) =>

    fs.readFileSync(path.join(frontendSrc, ...segments), 'utf8');



  it('defines primary create routes on Brand Studio, not Generation', () => {

    const source = read('lib', 'product-path.ts');



    expect(source).toMatch(/blitz:\s*["']\/studio\/blitz["']/);

    expect(source).toMatch(/videos:\s*["']\/studio\/videos["']/);

    expect(source).toMatch(/businessDna:\s*["']\/studio\/business-dna["']/);

    expect(source).toMatch(/library:\s*["']\/studio\/library["']/);

    expect(source).toMatch(/LEGACY_GENERATION_PRIMARY\s*=\s*false/);
    expect(source).not.toMatch(/products:\s*["']/);
    expect(source).not.toMatch(/brands:\s*["']\/brand-kits["']/);

  });



  it('retires /brand-kits as a user-facing path in favor of Business DNA', () => {

    const nextConfig = fs.readFileSync(

      path.join(repoRoot, 'frontend', 'next.config.ts'),

      'utf8',

    );

    const brandKitsPage = read('app', 'brand-kits', 'page.tsx');

    const sidebar = read('components', 'studio', 'studio-sidebar.tsx');

    const header = read('components', 'header.tsx');

    const products = read('app', 'products', 'page.tsx');

    const businessDna = read('app', 'studio', 'business-dna', 'page.tsx');



    expect(nextConfig).toMatch(/source:\s*["']\/brand-kits["']/);

    expect(nextConfig).toMatch(

      /destination:\s*["']\/studio\/business-dna["']/,

    );

    expect(brandKitsPage).toMatch(/redirect/);

    expect(brandKitsPage).toMatch(/PRODUCT_PATH\.businessDna|business-dna/);

    expect(sidebar).toMatch(/PRODUCT_PATH\.businessDna/);

    expect(sidebar).not.toMatch(/PRODUCT_PATH\.brands/);

    expect(sidebar).not.toMatch(/PRODUCT_PATH\.products/);

    expect(sidebar).not.toMatch(/label:\s*["']Brands["']/);

    expect(sidebar).not.toMatch(/label:\s*["']Products["']/);

    expect(header).not.toMatch(/>\s*Brands\s*</);

    expect(header).not.toMatch(/>\s*Products\s*</);

    expect(header).not.toMatch(/PRODUCT_PATH\.brands/);

    expect(header).not.toMatch(/PRODUCT_PATH\.products/);

    expect(products).toMatch(/redirect/);

    expect(products).toMatch(/PRODUCT_PATH\.library/);

    expect(businessDna).toMatch(/BrandConfirmForm|Brand Confirm/);

    expect(businessDna).not.toMatch(/href=["']\/brand-kits["']/);

  });



  it('Posts/Videos use Media Store and studio-core jobs, not products library', () => {

    const posts = read('app', 'studio', 'posts', 'page.tsx');

    const videos = read('app', 'studio', 'videos', 'page.tsx');

    const blitz = read('app', 'studio', 'blitz', 'page.tsx');

    const nextConfig = fs.readFileSync(

      path.join(repoRoot, 'frontend', 'next.config.ts'),

      'utf8',

    );



    expect(nextConfig).toMatch(/source:\s*["']\/studio\/posts["']/);

    expect(nextConfig).toMatch(/destination:\s*["']\/studio\/blitz["']/);

    expect(posts).toMatch(/redirect/);

    expect(posts).toMatch(/PRODUCT_PATH\.blitz/);

    expect(blitz).toMatch(/useMediaAssets|useGenerateAiImage/);

    expect(blitz).not.toMatch(/useProducts|useCreateImageJob/);

    expect(videos).not.toMatch(/InlineProductCreate/);

    expect(videos).not.toMatch(/href=["']\/products["']/);

  });



  it('home defaults to Fetra create path; BrandGeneration only behind legacy flag', () => {

    const productPath = read('lib', 'product-path.ts');

    const landing = read('components', 'marketing', 'landing-page.tsx');



    expect(productPath).toMatch(/LEGACY_GENERATION_PRIMARY\s*=\s*false/);

    expect(landing).not.toMatch(/useCreateGeneration/);

    expect(landing).not.toMatch(/\/generations/);

  });



  it('primary header nav links to Fetra paths, not Generation library', () => {

    const source = read('components', 'header.tsx');



    expect(source).toMatch(/PRODUCT_PATH/);

    expect(source).toMatch(/Blitz/);

    expect(source).toMatch(/Viral Remix/);

    expect(source).toMatch(/Business DNA/);

    expect(source).toMatch(/Brand Studio/);

    expect(source).not.toMatch(/\/generations/);

    expect(source).not.toMatch(/>\s*Generator\s*</);

    expect(source).not.toMatch(/New Generation/);

  });



  it('studio sidebar exposes Blitz / Viral Remix / Business DNA without Generation', () => {

    const source = read('components', 'studio', 'studio-sidebar.tsx');



    expect(source).toMatch(/PRODUCT_PATH\.blitz/);

    expect(source).toMatch(/PRODUCT_PATH\.videos/);

    expect(source).toMatch(/PRODUCT_PATH\.businessDna/);

    expect(source).toMatch(/Blitz/);

    expect(source).toMatch(/Viral Remix/);

    expect(source).toMatch(/Business DNA/);

    expect(source).not.toMatch(/\/generations/);

    expect(source).not.toMatch(/Generation/);

    expect(source).not.toMatch(/Make a Post/);

  });



  it('login and signup land in Brand Studio, not Generation home', () => {

    const source = read('lib', 'hooks', 'use-auth.ts');



    expect(source).toMatch(/PRODUCT_PATH\.studio/);

    expect(source).toMatch(/router\.push\(PRODUCT_PATH\.studio\)/);

    expect(source).not.toMatch(

      /Redirect to generator as per Phase 1 requirements/,

    );

  });



  it('legacy routes redirect away from primary create CTA', () => {

    const nextConfig = fs.readFileSync(

      path.join(repoRoot, 'frontend', 'next.config.ts'),

      'utf8',

    );

    const generations = read('app', 'generations', 'page.tsx');

    const myVideos = read('app', 'my-videos', 'page.tsx');



    expect(nextConfig).toMatch(/source:\s*["']\/generations["']/);

    expect(nextConfig).toMatch(/source:\s*["']\/my-videos["']/);

    expect(generations).toMatch(/redirect/);

    expect(myVideos).toMatch(/redirect/);

  });

});


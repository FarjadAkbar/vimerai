import { readFileSync } from 'fs';
import { join } from 'path';
import { parseHomepageHtml } from '@/infrastructure/scrape/html-homepage-scrape.provider';

describe('parseHomepageHtml', () => {
  it('extracts title, description, logo candidate, and text from fixture HTML', () => {
    const html = readFileSync(
      join(
        __dirname,
        '../../testing/fixtures/scrape/nitroshine-homepage.html',
      ),
      'utf8',
    );

    const result = parseHomepageHtml('https://nitroshinepro.com/', html);

    expect(result.title).toContain('NitroShine');
    expect(result.description).toContain('Showroom Shine');
    expect(result.logoCandidateUrl).toBe(
      'https://nitroshinepro.com/og-logo.png',
    );
    expect(result.textContent).toContain('Karachi');
    expect(result.url).toBe('https://nitroshinepro.com/');
  });
});

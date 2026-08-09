import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import type { IHomepageScrapeProvider } from '@/core/ports/homepage-scrape.provider';
import type { HomepageScrapeResult } from '@/types/brand/business-dna';

const MAX_HTML_CHARS = 400_000;
const MAX_TEXT_CHARS = 12_000;

@Injectable()
export class HtmlHomepageScrapeProvider implements IHomepageScrapeProvider {
  async scrape(url: string): Promise<HomepageScrapeResult> {
    const normalized = normalizeUrl(url);
    let html: string;
    try {
      const response = await axios.get<string>(normalized, {
        timeout: 20_000,
        maxContentLength: MAX_HTML_CHARS,
        responseType: 'text',
        headers: {
          'User-Agent': 'VimeraiBusinessDnaBot/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
        validateStatus: (status) => status >= 200 && status < 400,
      });
      html = typeof response.data === 'string' ? response.data : '';
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error
          ? `Failed to fetch homepage: ${error.message}`
          : 'Failed to fetch homepage',
      );
    }

    if (!html.trim()) {
      throw new BadRequestException('Homepage returned empty HTML');
    }

    return parseHomepageHtml(normalized, html);
  }
}

export function parseHomepageHtml(
  url: string,
  html: string,
): HomepageScrapeResult {
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description =
    metaContent(html, 'description') ??
    metaProperty(html, 'og:description') ??
    null;
  const logoCandidateUrl =
    absoluteUrl(url, metaProperty(html, 'og:image')) ??
    absoluteUrl(url, linkHref(html, 'icon')) ??
    absoluteUrl(url, linkHref(html, 'apple-touch-icon')) ??
    null;
  const previewImageUrl =
    absoluteUrl(url, metaProperty(html, 'og:image')) ?? logoCandidateUrl;
  const textContent = extractVisibleText(html).slice(0, MAX_TEXT_CHARS);

  return {
    url,
    title: title?.trim() || null,
    description: description?.trim() || null,
    textContent,
    logoCandidateUrl,
    previewImageUrl,
  };
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new BadRequestException('URL is required');
  }
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new BadRequestException('Invalid URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException('URL must be http or https');
  }
  return parsed.toString();
}

function metaContent(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["'][^>]*>`,
    'i',
  );
  const match = html.match(re);
  return match?.[1] ?? match?.[2] ?? null;
}

function metaProperty(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["'][^>]*>`,
    'i',
  );
  const match = html.match(re);
  return match?.[1] ?? match?.[2] ?? null;
}

function linkHref(html: string, rel: string): string | null {
  const re = new RegExp(
    `<link[^>]+rel=["'][^"']*${rel}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>|<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${rel}[^"']*["'][^>]*>`,
    'i',
  );
  const match = html.match(re);
  return match?.[1] ?? match?.[2] ?? null;
}

function firstMatch(html: string, re: RegExp): string | null {
  const match = html.match(re);
  return match?.[1] ? decodeHtml(match[1]) : null;
}

function extractVisibleText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  const text = withoutScripts
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return decodeHtml(text);
}

function absoluteUrl(base: string, href: string | null): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import type { IProductScrapeProvider } from '@/core/ports/product-scrape.provider';
import type {
  ProductScrapeOutcome,
  ProductScrapeResult,
} from '@/types/product/product-scrape';

const MAX_HTML_CHARS = 400_000;

@Injectable()
export class HtmlProductScrapeProvider implements IProductScrapeProvider {
  async scrape(url: string): Promise<ProductScrapeOutcome> {
    const normalized = normalizeUrl(url);
    if (!normalized.ok) {
      return { ok: false, error: normalized.error };
    }

    let html: string;
    try {
      const response = await axios.get<string>(normalized.url, {
        timeout: 20_000,
        maxContentLength: MAX_HTML_CHARS,
        responseType: 'text',
        headers: {
          'User-Agent': 'VimeraiProductScrapeBot/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
        validateStatus: (status) => status >= 200 && status < 400,
      });
      html = typeof response.data === 'string' ? response.data : '';
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'fetch_failed',
          message:
            error instanceof Error
              ? `Failed to fetch product page: ${error.message}`
              : 'Failed to fetch product page',
        },
      };
    }

    if (!html.trim()) {
      return {
        ok: false,
        error: {
          code: 'empty_html',
          message: 'Product page returned empty HTML',
        },
      };
    }

    return parseProductHtml(normalized.url, html);
  }
}

export function parseProductHtml(
  url: string,
  html: string,
): ProductScrapeOutcome {
  const fromJsonLd = parseJsonLdProduct(url, html);
  if (fromJsonLd) {
    return { ok: true, product: fromJsonLd };
  }

  const fromOg = parseOpenGraphProduct(url, html);
  if (fromOg) {
    return { ok: true, product: fromOg };
  }

  return {
    ok: false,
    error: {
      code: 'missing_required_fields',
      message:
        'Could not find product name, description, and images on this page',
    },
  };
}

function parseJsonLdProduct(
  url: string,
  html: string,
): ProductScrapeResult | null {
  const scriptRe =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRe.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      continue;
    }
    const productNode = findProductNode(parsed);
    if (!productNode) continue;

    const name = readString(productNode.name)?.trim() ?? null;
    const description = readString(productNode.description)?.trim() ?? null;
    const imageUrls = collectImageUrls(url, productNode.image);
    const price = extractPrice(productNode.offers);

    if (name && description && imageUrls.length > 0) {
      return {
        sourceUrl: url,
        name,
        description,
        imageUrls,
        price,
      };
    }
  }
  return null;
}

function parseOpenGraphProduct(
  url: string,
  html: string,
): ProductScrapeResult | null {
  const name =
    metaProperty(html, 'og:title')?.trim() ||
    firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)?.trim() ||
    null;
  const description =
    metaProperty(html, 'og:description')?.trim() ||
    metaContent(html, 'description')?.trim() ||
    null;
  const image =
    absoluteUrl(url, metaProperty(html, 'og:image')) ??
    absoluteUrl(url, metaProperty(html, 'og:image:secure_url'));
  const imageUrls = image ? [image] : [];
  const price =
    metaProperty(html, 'product:price:amount')?.trim() ||
    metaContent(html, 'product:price:amount')?.trim() ||
    null;

  if (name && description && imageUrls.length > 0) {
    return {
      sourceUrl: url,
      name: stripTitleSuffix(name),
      description,
      imageUrls,
      price,
    };
  }
  return null;
}

function findProductNode(
  value: unknown,
): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findProductNode(item);
      if (found) return found;
    }
    return null;
  }
  if (!isRecord(value)) return null;

  if (isProductType(value['@type'])) {
    return value;
  }

  const graph = value['@graph'];
  if (Array.isArray(graph)) {
    return findProductNode(graph);
  }

  return null;
}

function isProductType(typeValue: unknown): boolean {
  if (typeof typeValue === 'string') {
    return typeValue.toLowerCase() === 'product';
  }
  if (Array.isArray(typeValue)) {
    return typeValue.some(
      (entry) =>
        typeof entry === 'string' && entry.toLowerCase() === 'product',
    );
  }
  return false;
}

function collectImageUrls(baseUrl: string, image: unknown): string[] {
  const urls: string[] = [];
  const push = (candidate: unknown) => {
    if (typeof candidate === 'string') {
      const absolute = absoluteUrl(baseUrl, candidate);
      if (absolute) urls.push(absolute);
      return;
    }
    if (isRecord(candidate)) {
      const nested =
        readString(candidate.url) ??
        readString(candidate.contentUrl) ??
        readString(candidate['@id']);
      if (nested) {
        const absolute = absoluteUrl(baseUrl, nested);
        if (absolute) urls.push(absolute);
      }
    }
  };

  if (Array.isArray(image)) {
    for (const entry of image) push(entry);
  } else {
    push(image);
  }

  return [...new Set(urls)];
}

function extractPrice(offers: unknown): string | null {
  if (Array.isArray(offers)) {
    for (const offer of offers) {
      const price = extractPrice(offer);
      if (price) return price;
    }
    return null;
  }
  if (!isRecord(offers)) return null;
  const price = readString(offers.price) ?? readNumberAsString(offers.price);
  return price?.trim() || null;
}

function normalizeUrl(
  raw: string,
):
  | { ok: true; url: string }
  | {
      ok: false;
      error: { code: 'invalid_url'; message: string };
    } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: { code: 'invalid_url', message: 'URL is required' },
    };
  }
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      ok: false,
      error: { code: 'invalid_url', message: 'Invalid URL' },
    };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      ok: false,
      error: { code: 'invalid_url', message: 'URL must be http or https' },
    };
  }
  return { ok: true, url: parsed.toString() };
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

function firstMatch(html: string, re: RegExp): string | null {
  const match = html.match(re);
  return match?.[1] ? decodeHtml(match[1]) : null;
}

function absoluteUrl(base: string, href: string | null): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function stripTitleSuffix(title: string): string {
  return title.replace(/\s*[|\-–].*$/, '').trim() || title.trim();
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readNumberAsString(value: unknown): string | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? String(value)
    : null;
}

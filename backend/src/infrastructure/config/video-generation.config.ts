import { registerAs } from '@nestjs/config';

const DEFAULT_FAL_BASE_URL = 'https://queue.fal.run/fal-ai/';
const DEFAULT_FAL_MODEL = 'pika/v2.2/text-to-video';

function resolveFalConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout: number;
} {
  const apiKey = process.env.FAL_KEY || '';
  const timeout = parseInt(process.env.FAL_TIMEOUT || '300000', 10);

  // Prefer baseUrl + model. Legacy FAL_API_URL (full URL) is supported as fallback.
  if (process.env.FAL_BASE_URL || process.env.FAL_MODEL) {
    return {
      apiKey,
      baseUrl: process.env.FAL_BASE_URL || DEFAULT_FAL_BASE_URL,
      model: process.env.FAL_MODEL || DEFAULT_FAL_MODEL,
      timeout,
    };
  }

  const legacyApiUrl = process.env.FAL_API_URL;
  if (legacyApiUrl) {
    const prefix = 'https://queue.fal.run/fal-ai/';
    if (legacyApiUrl.startsWith(prefix)) {
      return {
        apiKey,
        baseUrl: DEFAULT_FAL_BASE_URL,
        model: legacyApiUrl.slice(prefix.length).replace(/^\/+/, ''),
        timeout,
      };
    }
  }

  return {
    apiKey,
    baseUrl: DEFAULT_FAL_BASE_URL,
    model: DEFAULT_FAL_MODEL,
    timeout,
  };
}

export default registerAs('videoGeneration', () => ({
  provider: process.env.VIDEO_GENERATION_PROVIDER || 'fal',
  fal: resolveFalConfig(),
}));

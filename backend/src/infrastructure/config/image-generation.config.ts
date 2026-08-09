import { registerAs } from '@nestjs/config';

const DEFAULT_FAL_BASE_URL = 'https://queue.fal.run/fal-ai/';
/** Product-conditioned Instagram feed stills (Post Jobs). */
const DEFAULT_FAL_IMAGE_MODEL = 'flux-pro/kontext';

export default registerAs('imageGeneration', () => ({
  fal: {
    apiKey: process.env.FAL_KEY || '',
    baseUrl: process.env.FAL_BASE_URL || DEFAULT_FAL_BASE_URL,
    model: process.env.FAL_IMAGE_MODEL || DEFAULT_FAL_IMAGE_MODEL,
    timeout: parseInt(process.env.FAL_TIMEOUT || '300000', 10),
  },
}));

import { registerAs } from '@nestjs/config';

export default registerAs('videoGeneration', () => ({
  sora: {
    apiKey: process.env.SORA_API_KEY || '',
    apiUrl:
      process.env.SORA_API_URL || 'https://api.openai.com/v1/video/generations',
    timeout: parseInt(process.env.SORA_TIMEOUT || '300000', 10), // 5 minutes default
  },
}));

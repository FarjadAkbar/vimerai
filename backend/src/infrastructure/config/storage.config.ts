import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  type: process.env.STORAGE_TYPE || 'local', // 'local', 's3', or 'r2'

  // Local storage (default)
  local: {
    uploadsDir: process.env.UPLOADS_DIR || 'uploads',
  },

  // S3-compatible (AWS S3, Supabase Storage, etc.)
  s3: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_BUCKET_NAME || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: process.env.AWS_ENDPOINT || '',
    publicBaseUrl: process.env.AWS_PUBLIC_BASE_URL || '',
  },

  // Cloudflare R2 configuration
  r2: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    customDomain: process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN || '',
  },
}));

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import { R2StorageService } from './r2-storage.service';
import { STORAGE_SERVICE_TOKEN } from '@/core/tokens/injection.tokens';

/**
 * Storage Module
 * 
 * Automatically selects storage provider based on STORAGE_TYPE config.
 * Follows the same pattern as payment and video generation services.
 * 
 * Usage:
 * - Set STORAGE_TYPE=local (default) for local filesystem
 * - Set STORAGE_TYPE=s3 for AWS S3 or S3-compatible (e.g. Supabase Storage)
 * - Set STORAGE_TYPE=r2 for Cloudflare R2
 *
 * For Supabase: set AWS_ENDPOINT, AWS_PUBLIC_BASE_URL, AWS_BUCKET_NAME, region, keys.
 * No code changes needed when switching providers - just update config.
 */
@Module({
  providers: [
    {
      provide: STORAGE_SERVICE_TOKEN,
      useFactory: (configService: ConfigService) => {
        const storageType =
          configService.get<string>('storage.type') || 'local';

        switch (storageType.toLowerCase()) {
          case 's3':
            return new S3StorageService(configService);
          case 'r2':
            return new R2StorageService(configService);
          case 'local':
          default:
            return new LocalStorageService(configService);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [STORAGE_SERVICE_TOKEN],
})
export class StorageModule {}


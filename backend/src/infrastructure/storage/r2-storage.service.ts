import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IStorageService } from '@/core/ports/storage.service';

/**
 * Cloudflare R2 storage implementation.
 * Uses S3-compatible API to upload files to Cloudflare R2.
 */
@Injectable()
export class R2StorageService implements IStorageService {
  private readonly r2Client: S3Client;
  private readonly bucketName: string;
  private readonly accountId: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const storageConfig = this.configService.get<{
      r2: {
        accountId: string;
        bucketName: string;
        accessKeyId: string;
        secretAccessKey: string;
        customDomain: string;
      };
    }>('storage');

    if (!storageConfig?.r2) {
      throw new Error('R2 storage configuration is missing');
    }

    this.accountId = storageConfig.r2.accountId || '';
    this.bucketName = storageConfig.r2.bucketName || '';
    const customDomain = storageConfig.r2.customDomain;

    if (!this.accountId || !this.bucketName) {
      throw new Error(
        'CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_R2_BUCKET_NAME are required in storage.r2 configuration',
      );
    }

    // Initialize R2 client (S3-compatible)
    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: storageConfig.r2.accessKeyId || '',
        secretAccessKey: storageConfig.r2.secretAccessKey || '',
      },
    });

    // Use custom domain if available, otherwise use R2 public URL
    this.baseUrl = customDomain
      ? `https://${customDomain}`
      : `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}`;
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // R2 doesn't support ACL, files are public if bucket is public
    });

    await this.r2Client.send(command);

    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.r2Client.send(command);
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}


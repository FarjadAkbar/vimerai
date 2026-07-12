import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IStorageService } from '@/core/ports/storage.service';

/**
 * S3-compatible storage (AWS S3, Supabase Storage, etc.).
 * Optional custom endpoint + forcePathStyle for non-AWS hosts.
 */
@Injectable()
export class S3StorageService implements IStorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly baseUrl: string;
  private readonly useAcl: boolean;

  constructor(private readonly configService: ConfigService) {
    const storageConfig = this.configService.get<{
      s3: {
        region: string;
        bucketName: string;
        accessKeyId: string;
        secretAccessKey: string;
        endpoint: string;
        publicBaseUrl: string;
      };
    }>('storage');

    if (!storageConfig?.s3) {
      throw new Error('S3 storage configuration is missing');
    }

    this.region = storageConfig.s3.region || 'us-east-1';
    this.bucketName = storageConfig.s3.bucketName || '';
    const endpoint = storageConfig.s3.endpoint?.trim() || '';
    const publicBaseUrl = storageConfig.s3.publicBaseUrl?.trim().replace(/\/$/, '') || '';

    if (!this.bucketName) {
      throw new Error('AWS_BUCKET_NAME is required in storage.s3 configuration');
    }

    this.useAcl = !endpoint;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: storageConfig.s3.accessKeyId || '',
        secretAccessKey: storageConfig.s3.secretAccessKey || '',
      },
      ...(endpoint
        ? {
            endpoint,
            forcePathStyle: true,
          }
        : {}),
    });

    this.baseUrl = publicBaseUrl
      ? publicBaseUrl
      : `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ...(this.useAcl ? { ACL: 'public-read' as const } : {}),
    });

    await this.s3Client.send(command);

    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}

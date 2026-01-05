import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorageService } from '@/core/ports/storage.service';

/**
 * Local filesystem storage implementation.
 * Saves files to the local filesystem and serves them via static file serving.
 */
@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    // Get uploads directory from config or use default
    const storageConfig = this.configService.get<{ local: { uploadsDir: string } }>('storage');
    this.uploadsDir = path.join(
      process.cwd(),
      storageConfig?.local?.uploadsDir || 'uploads',
    );

    // Get base URL from config or use default
    const port = this.configService.get<number>('server.port') || 8001;
    this.baseUrl = process.env.APP_URL || `http://localhost:${port}`;
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const filePath = path.join(this.uploadsDir, key);
    const dirPath = path.dirname(filePath);

    // Create directory structure if it doesn't exist
    await fs.mkdir(dirPath, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    // Return public URL
    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, ignore
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getUrl(key: string): string {
    // Return URL path (served statically via /uploads prefix)
    return `${this.baseUrl}/uploads/${key}`;
  }
}


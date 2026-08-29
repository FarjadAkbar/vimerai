import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type {
  CreateMediaAssetInput,
  IMediaAssetService,
  UploadMediaAssetInput,
} from '@/core/ports/media-asset.service';
import type { IMediaAssetRepository } from '@/core/ports/media-asset.repository';
import type { IStorageService } from '@/core/ports/storage.service';
import {
  MEDIA_ASSET_REPOSITORY_TOKEN,
  STORAGE_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import { MediaAsset } from '@/domain/media-asset.entity';
import {
  extensionForContentType,
  inferMediaAssetKind,
  maxUploadBytesForKind,
} from './media-asset-upload';

@Injectable()
export class MediaAssetService implements IMediaAssetService {
  constructor(
    @Inject(MEDIA_ASSET_REPOSITORY_TOKEN)
    private readonly mediaAssetRepository: IMediaAssetRepository,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
  ) {}

  async uploadMediaAsset(
    userId: string,
    input: UploadMediaAssetInput,
  ): Promise<MediaAsset> {
    const contentType = input.contentType.trim().toLowerCase();
    const kind = inferMediaAssetKind(contentType);
    const maxBytes = maxUploadBytesForKind(kind);
    if (input.sizeBytes > maxBytes) {
      throw new BadRequestException(
        `File exceeds the ${Math.floor(maxBytes / (1024 * 1024))}MB limit for ${kind} uploads`,
      );
    }

    const extension = extensionForContentType(contentType);
    const key = `media-assets/${userId}/${uuidv4()}.${extension}`;
    const url = await this.storageService.upload(
      key,
      input.buffer,
      contentType,
    );

    return this.createMediaAsset(userId, {
      kind,
      name: input.originalName.trim() || `upload.${extension}`,
      url,
      mimeType: contentType,
      sizeBytes: input.sizeBytes,
    });
  }

  async createMediaAsset(
    userId: string,
    input: CreateMediaAssetInput,
  ): Promise<MediaAsset> {
    const name = input.name.trim();
    const url = input.url.trim();
    if (!name) {
      throw new BadRequestException('Media asset name is required');
    }
    if (!url) {
      throw new BadRequestException('Media asset URL is required');
    }

    const asset = MediaAsset.create({
      id: uuidv4(),
      userId,
      kind: input.kind,
      name,
      url,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });
    await this.mediaAssetRepository.create(asset);
    return asset;
  }

  async listMediaAssets(
    userId: string,
    filter?: { kind?: MediaAsset['kind'] },
  ): Promise<MediaAsset[]> {
    return this.mediaAssetRepository.findByUserId(userId, filter);
  }

  async getMediaAsset(userId: string, id: string): Promise<MediaAsset> {
    const asset = await this.mediaAssetRepository.findById(id);
    if (!asset || asset.userId !== userId) {
      throw new NotFoundException('Media asset not found');
    }
    return asset;
  }
}

import type { MediaAsset, MediaAssetKind } from '@/domain/media-asset.entity';

export interface CreateMediaAssetInput {
  kind: MediaAssetKind;
  name: string;
  url: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
}

export interface IMediaAssetService {
  createMediaAsset(
    userId: string,
    input: CreateMediaAssetInput,
  ): Promise<MediaAsset>;
  listMediaAssets(
    userId: string,
    filter?: { kind?: MediaAssetKind },
  ): Promise<MediaAsset[]>;
  getMediaAsset(userId: string, id: string): Promise<MediaAsset>;
}

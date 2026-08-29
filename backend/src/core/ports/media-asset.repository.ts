import type { MediaAsset, MediaAssetKind } from '@/domain/media-asset.entity';

export interface ListMediaAssetsFilter {
  kind?: MediaAssetKind;
}

export interface IMediaAssetRepository {
  create(asset: MediaAsset): Promise<void>;
  findById(id: string): Promise<MediaAsset | null>;
  findByUserId(
    userId: string,
    filter?: ListMediaAssetsFilter,
  ): Promise<MediaAsset[]>;
  update(asset: MediaAsset): Promise<void>;
  delete(id: string): Promise<void>;
}

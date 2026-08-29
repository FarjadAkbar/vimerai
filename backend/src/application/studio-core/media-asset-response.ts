import type { MediaAsset } from '@/domain/media-asset.entity';

export type MediaAssetResponse = {
  id: string;
  kind: MediaAsset['kind'];
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
};

export function toMediaAssetResponse(asset: MediaAsset): MediaAssetResponse {
  return {
    id: asset.id,
    kind: asset.kind,
    name: asset.name,
    url: asset.url,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  };
}

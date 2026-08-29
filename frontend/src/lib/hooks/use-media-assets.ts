import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  mediaAssetsApi,
  type MediaAsset,
  type MediaAssetKind,
} from '@/lib/api/media-assets.api';

export function useMediaAssets(kind?: MediaAssetKind, enabled = true) {
  return useQuery({
    queryKey: ['media-assets', kind ?? 'all'],
    queryFn: () => mediaAssetsApi.list(kind),
    enabled,
  });
}

export function useUploadMediaAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => mediaAssetsApi.upload(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
      return result;
    },
  });
}

export type MediaLibraryItem = Pick<
  MediaAsset,
  'id' | 'name' | 'url' | 'kind' | 'createdAt'
>;

export function mapMediaAssetToLibraryItem(asset: MediaAsset): MediaLibraryItem {
  return {
    id: asset.id,
    name: asset.name,
    url: asset.url,
    kind: asset.kind,
    createdAt: asset.createdAt,
  };
}

/** @deprecated Use useMediaAssets */
export function useBlitzMediaLibrary(kind?: MediaAssetKind, enabled = true) {
  const query = useMediaAssets(kind, enabled);
  const items = (query.data?.assets ?? []).map(mapMediaAssetToLibraryItem);

  return {
    items,
    all: items,
    ready: !query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

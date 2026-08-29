import type {
  IMediaAssetRepository,
  ListMediaAssetsFilter,
} from '@/core/ports/media-asset.repository';
import { MediaAsset } from '@/domain/media-asset.entity';

export class InMemoryMediaAssetRepository implements IMediaAssetRepository {
  private readonly items = new Map<string, MediaAsset>();

  async create(asset: MediaAsset): Promise<void> {
    this.items.set(asset.id, asset);
  }

  async findById(id: string): Promise<MediaAsset | null> {
    return this.items.get(id) ?? null;
  }

  async findByUserId(
    userId: string,
    filter?: ListMediaAssetsFilter,
  ): Promise<MediaAsset[]> {
    return [...this.items.values()]
      .filter((asset) => asset.userId === userId)
      .filter((asset) => (filter?.kind ? asset.kind === filter.kind : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(asset: MediaAsset): Promise<void> {
    this.items.set(asset.id, asset);
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}

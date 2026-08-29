import { MediaAssetService } from '@/application/studio-core/media-asset.service';
import { MediaAssetKind } from '@/domain/media-asset.entity';
import { InMemoryMediaAssetRepository } from '@/testing/fakes/in-memory-media-asset.repository';

describe('MediaAssetService', () => {
  it('creates a media asset for every upload', async () => {
    const repo = new InMemoryMediaAssetRepository();
    const service = new MediaAssetService(repo);

    const asset = await service.createMediaAsset('user-1', {
      kind: MediaAssetKind.IMAGE,
      name: 'product.jpg',
      url: 'https://cdn.example.com/product.jpg',
      mimeType: 'image/jpeg',
    });

    expect(asset.userId).toBe('user-1');
    expect(asset.kind).toBe(MediaAssetKind.IMAGE);
    expect(await service.listMediaAssets('user-1')).toHaveLength(1);
  });

  it('lists media assets by kind', async () => {
    const repo = new InMemoryMediaAssetRepository();
    const service = new MediaAssetService(repo);

    await service.createMediaAsset('user-1', {
      kind: MediaAssetKind.VIDEO,
      name: 'ref.mp4',
      url: 'https://cdn.example.com/ref.mp4',
    });
    await service.createMediaAsset('user-1', {
      kind: MediaAssetKind.AUDIO,
      name: 'track.mp3',
      url: 'https://cdn.example.com/track.mp3',
    });

    const videos = await service.listMediaAssets('user-1', {
      kind: MediaAssetKind.VIDEO,
    });

    expect(videos).toHaveLength(1);
    expect(videos[0].name).toBe('ref.mp4');
  });
});

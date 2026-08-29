import { BadRequestException } from '@nestjs/common';
import { MediaAssetService } from '@/application/studio-core/media-asset.service';
import { MediaAssetKind } from '@/domain/media-asset.entity';
import type { IStorageService } from '@/core/ports/storage.service';
import { InMemoryMediaAssetRepository } from '@/testing/fakes/in-memory-media-asset.repository';

function storageFake(): IStorageService {
  return {
    upload: async (key) => `https://cdn.example.com/${key}`,
    delete: async () => undefined,
    getUrl: (key) => `https://cdn.example.com/${key}`,
  };
}

describe('MediaAssetService', () => {
  it('creates a media asset for every upload', async () => {
    const repo = new InMemoryMediaAssetRepository();
    const service = new MediaAssetService(repo, storageFake());

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
    const service = new MediaAssetService(repo, storageFake());

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

  it('uploads a file to storage and persists a media asset', async () => {
    const repo = new InMemoryMediaAssetRepository();
    const storage = storageFake();
    const service = new MediaAssetService(repo, storage);

    const asset = await service.uploadMediaAsset('user-1', {
      buffer: Buffer.from('fake-image'),
      contentType: 'image/png',
      originalName: 'overlay.png',
      sizeBytes: 1024,
    });

    expect(asset.kind).toBe(MediaAssetKind.IMAGE);
    expect(asset.url).toContain('media-assets/user-1/');
    expect(asset.name).toBe('overlay.png');
    expect(await service.listMediaAssets('user-1')).toHaveLength(1);
  });

  it('rejects unsupported upload types', async () => {
    const service = new MediaAssetService(
      new InMemoryMediaAssetRepository(),
      storageFake(),
    );

    await expect(
      service.uploadMediaAsset('user-1', {
        buffer: Buffer.from('bad'),
        contentType: 'application/pdf',
        originalName: 'doc.pdf',
        sizeBytes: 100,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

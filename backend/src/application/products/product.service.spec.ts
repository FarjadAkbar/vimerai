import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from '@/application/products/product.service';
import { BrandKit } from '@/domain/brand-kit.entity';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import type { IStorageService } from '@/core/ports/storage.service';
import { InMemoryBrandKitRepository } from '@/testing/fakes/in-memory-brand-kit.repository';
import { InMemoryProductRepository } from '@/testing/fakes/in-memory-product.repository';

function storageFake(): IStorageService {
  return {
    upload: async (key) => `https://cdn.example.com/${key}`,
    delete: async () => undefined,
    getUrl: (key) => `https://cdn.example.com/${key}`,
  };
}

async function seedBrandKit(
  repo: IBrandKitRepository,
  userId: string,
  id: string,
  name: string,
) {
  await repo.create(
    BrandKit.create(
      id,
      userId,
      name,
      'https://cdn.example.com/logo.png',
      { primary: '#111111', secondary: '#222222' },
      'professional',
      'Buyers',
      'Slang',
    ),
  );
}

describe('ProductService', () => {
  let brandKits: InMemoryBrandKitRepository;
  let products: InMemoryProductRepository;
  let service: ProductService;

  beforeEach(() => {
    brandKits = new InMemoryBrandKitRepository();
    products = new InMemoryProductRepository();
    service = new ProductService(products, brandKits, storageFake());
  });

  it('blocks Product create when the user has no Brand Kit', async () => {
    await expect(
      service.createProduct('user-1', {
        name: 'Serum',
        description: 'Hydrating',
        imageUrls: ['https://cdn.example.com/p.jpg'],
        landingPageUrl: 'https://shop.example.com/serum',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('default-links a Product when the user has exactly one Brand Kit', async () => {
    await seedBrandKit(brandKits, 'user-1', 'kit-1', 'Nitro');

    const result = await service.createProduct('user-1', {
      name: 'Serum',
      description: 'Hydrating serum',
      imageUrls: ['https://cdn.example.com/p.jpg'],
      landingPageUrl: 'https://shop.example.com/serum',
      price: '49.00',
    });

    expect(result.product.name).toBe('Serum');
    expect(result.product.brandKitIds).toEqual(['kit-1']);
    expect(result.product.price).toBe('49.00');
  });

  it('requires Brand Kit ids when the user has multiple Brand Kits', async () => {
    await seedBrandKit(brandKits, 'user-1', 'kit-1', 'Nitro');
    await seedBrandKit(brandKits, 'user-1', 'kit-2', 'Aura');

    await expect(
      service.createProduct('user-1', {
        name: 'Serum',
        description: 'Hydrating',
        imageUrls: ['https://cdn.example.com/p.jpg'],
        landingPageUrl: 'https://shop.example.com/serum',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    const linked = await service.createProduct('user-1', {
      name: 'Serum',
      description: 'Hydrating',
      imageUrls: ['https://cdn.example.com/p.jpg'],
      landingPageUrl: 'https://shop.example.com/serum',
      brandKitIds: ['kit-1', 'kit-2'],
    });

    expect(linked.product.brandKitIds.sort()).toEqual(['kit-1', 'kit-2']);
  });

  it('lists only Products owned by the user with their links', async () => {
    await seedBrandKit(brandKits, 'user-1', 'kit-1', 'Nitro');
    await service.createProduct('user-1', {
      name: 'Mine',
      description: 'Desc',
      imageUrls: ['https://cdn.example.com/a.jpg'],
      landingPageUrl: 'https://shop.example.com/a',
    });
    await seedBrandKit(brandKits, 'user-2', 'kit-other', 'Other');
    await service.createProduct('user-2', {
      name: 'Theirs',
      description: 'Desc',
      imageUrls: ['https://cdn.example.com/b.jpg'],
      landingPageUrl: 'https://shop.example.com/b',
    });

    const result = await service.listProducts('user-1');
    expect(result.products).toHaveLength(1);
    expect(result.products[0].name).toBe('Mine');
  });

  it('forbids updating another user Product', async () => {
    await seedBrandKit(brandKits, 'user-1', 'kit-1', 'Nitro');
    const created = await service.createProduct('user-1', {
      name: 'Serum',
      description: 'Hydrating',
      imageUrls: ['https://cdn.example.com/p.jpg'],
      landingPageUrl: 'https://shop.example.com/serum',
    });

    await expect(
      service.updateProduct('intruder', created.product.id, { name: 'Stolen' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns not found for missing Product', async () => {
    await expect(
      service.updateProduct('user-1', 'missing', { name: 'Nope' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('uploads a product image and returns a storage URL', async () => {
    const result = await service.uploadImage(
      'user-1',
      Buffer.from('img'),
      'image/jpeg',
    );
    expect(result.imageUrl).toContain('user-1');
    expect(result.imageUrl).toContain('https://cdn.example.com/');
  });
});

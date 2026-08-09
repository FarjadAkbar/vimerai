import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import type { IProductRepository } from '@/core/ports/product.repository';
import type {
  CreateProductInput,
  IProductService,
  UpdateProductInput,
} from '@/core/ports/product.service';
import type { IStorageService } from '@/core/ports/storage.service';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  STORAGE_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import { Product } from '@/domain/product.entity';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
    @Inject(BRAND_KIT_REPOSITORY_TOKEN)
    private readonly brandKitRepository: IBrandKitRepository,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
  ) {}

  async createProduct(userId: string, input: CreateProductInput) {
    const brandKitIds = await this.resolveBrandKitIds(
      userId,
      input.brandKitIds,
    );
    const product = Product.create(
      uuidv4(),
      userId,
      input.name,
      input.description,
      input.imageUrls,
      input.landingPageUrl ?? '',
      brandKitIds,
      input.price ?? null,
    );
    await this.productRepository.create(product);
    return { product };
  }

  async listProducts(userId: string) {
    const products = await this.productRepository.findByUserId(userId);
    return { products };
  }

  async updateProduct(
    userId: string,
    id: string,
    input: UpdateProductInput,
  ) {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Product not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this Product');
    }

    let brandKitIds = input.brandKitIds;
    if (brandKitIds !== undefined) {
      brandKitIds = await this.resolveBrandKitIds(userId, brandKitIds);
    }

    const updated = existing.update({
      ...input,
      brandKitIds,
    });
    await this.productRepository.update(updated);
    return { product: updated };
  }

  async uploadImage(userId: string, buffer: Buffer, contentType: string) {
    const extension =
      contentType === 'image/jpeg'
        ? 'jpg'
        : contentType === 'image/webp'
          ? 'webp'
          : 'png';
    const key = `products/${userId}/${uuidv4()}.${extension}`;
    const imageUrl = await this.storageService.upload(key, buffer, contentType);
    return { imageUrl };
  }

  private async resolveBrandKitIds(
    userId: string,
    requestedIds: string[] | undefined,
  ): Promise<string[]> {
    if (!requestedIds || requestedIds.length === 0) {
      return [];
    }

    const kits = await this.brandKitRepository.findByUserId(userId);
    const owned = new Set(kits.map((kit) => kit.id));
    const invalid = requestedIds.filter((id) => !owned.has(id));
    if (invalid.length > 0) {
      throw new BadRequestException(
        'One or more Brands are invalid or not owned by you',
      );
    }
    return [...new Set(requestedIds)];
  }
}

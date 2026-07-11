import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { IProductRepository } from '@/core/ports/product.repository';
import { Product } from '@/domain/product.entity';
import { BrandKitEntity } from '../entities/brand-kit.entity';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class TypeOrmProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(BrandKitEntity)
    private readonly brandKitRepository: Repository<BrandKitEntity>,
  ) {}

  async create(product: Product): Promise<void> {
    const brandKits = await this.loadBrandKits(product.brandKitIds);
    await this.productRepository.save(
      ProductEntity.fromDomain(product, brandKits),
    );
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.productRepository.findOne({ where: { id } });
    return entity ? ProductEntity.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Product[]> {
    const entities = await this.productRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => ProductEntity.toDomain(entity));
  }

  async update(product: Product): Promise<void> {
    const brandKits = await this.loadBrandKits(product.brandKitIds);
    await this.productRepository.save(
      ProductEntity.fromDomain(product, brandKits),
    );
  }

  private async loadBrandKits(ids: string[]): Promise<BrandKitEntity[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.brandKitRepository.findBy({ id: In(ids) });
  }
}

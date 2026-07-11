import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import { BrandKit } from '@/domain/brand-kit.entity';
import { BrandKitEntity } from '../entities/brand-kit.entity';

@Injectable()
export class TypeOrmBrandKitRepository implements IBrandKitRepository {
  constructor(
    @InjectRepository(BrandKitEntity)
    private readonly repository: Repository<BrandKitEntity>,
  ) {}

  async create(brandKit: BrandKit): Promise<void> {
    await this.repository.save(BrandKitEntity.fromDomain(brandKit));
  }

  async findById(id: string): Promise<BrandKit | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? BrandKitEntity.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<BrandKit[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => BrandKitEntity.toDomain(entity));
  }

  async update(brandKit: BrandKit): Promise<void> {
    await this.repository.save(BrandKitEntity.fromDomain(brandKit));
  }
}

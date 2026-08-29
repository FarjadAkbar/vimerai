import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  IMediaAssetRepository,
  ListMediaAssetsFilter,
} from '@/core/ports/media-asset.repository';
import { MediaAsset } from '@/domain/media-asset.entity';
import { MediaAssetEntity } from '../entities/media-asset.entity';

@Injectable()
export class TypeOrmMediaAssetRepository implements IMediaAssetRepository {
  constructor(
    @InjectRepository(MediaAssetEntity)
    private readonly repository: Repository<MediaAssetEntity>,
  ) {}

  async create(asset: MediaAsset): Promise<void> {
    await this.repository.save(MediaAssetEntity.fromDomain(asset));
  }

  async findById(id: string): Promise<MediaAsset | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? MediaAssetEntity.toDomain(entity) : null;
  }

  async findByUserId(
    userId: string,
    filter?: ListMediaAssetsFilter,
  ): Promise<MediaAsset[]> {
    const qb = this.repository
      .createQueryBuilder('asset')
      .where('asset.userId = :userId', { userId })
      .orderBy('asset.createdAt', 'DESC');

    if (filter?.kind) {
      qb.andWhere('asset.kind = :kind', { kind: filter.kind });
    }

    const entities = await qb.getMany();
    return entities.map((entity) => MediaAssetEntity.toDomain(entity));
  }

  async update(asset: MediaAsset): Promise<void> {
    await this.repository.save(MediaAssetEntity.fromDomain(asset));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}

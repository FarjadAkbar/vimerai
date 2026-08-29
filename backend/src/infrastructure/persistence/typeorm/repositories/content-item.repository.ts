import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  IContentItemRepository,
  ListContentItemsFilter,
} from '@/core/ports/content-item.repository';
import { ContentItem } from '@/domain/content-item.entity';
import { ContentItemEntity } from '../entities/content-item.entity';

@Injectable()
export class TypeOrmContentItemRepository implements IContentItemRepository {
  constructor(
    @InjectRepository(ContentItemEntity)
    private readonly repository: Repository<ContentItemEntity>,
  ) {}

  async create(item: ContentItem): Promise<void> {
    await this.repository.save(ContentItemEntity.fromDomain(item));
  }

  async findById(id: string): Promise<ContentItem | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ContentItemEntity.toDomain(entity) : null;
  }

  async findByJobId(jobId: string): Promise<ContentItem | null> {
    const entity = await this.repository.findOne({ where: { jobId } });
    return entity ? ContentItemEntity.toDomain(entity) : null;
  }

  async findByUserId(
    userId: string,
    _filter?: ListContentItemsFilter,
  ): Promise<ContentItem[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => ContentItemEntity.toDomain(entity));
  }

  async update(item: ContentItem): Promise<void> {
    await this.repository.save(ContentItemEntity.fromDomain(item));
  }
}

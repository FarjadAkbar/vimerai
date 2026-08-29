import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IAiInfluencerRepository } from '@/core/ports/ai-influencer.repository';
import { AiInfluencer } from '@/domain/ai-influencer.entity';
import { AiInfluencerEntity } from '../entities/ai-influencer.entity';

@Injectable()
export class TypeOrmAiInfluencerRepository implements IAiInfluencerRepository {
  constructor(
    @InjectRepository(AiInfluencerEntity)
    private readonly repository: Repository<AiInfluencerEntity>,
  ) {}

  async create(influencer: AiInfluencer): Promise<void> {
    await this.repository.save(AiInfluencerEntity.fromDomain(influencer));
  }

  async findById(id: string): Promise<AiInfluencer | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? AiInfluencerEntity.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<AiInfluencer[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => AiInfluencerEntity.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}

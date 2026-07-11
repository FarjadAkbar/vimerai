import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IGenerationRepository } from '@/core/ports/generation.repository';
import { Generation } from '@/domain/generation.entity';
import { GenerationEntity } from '../entities/generation.entity';

@Injectable()
export class TypeOrmGenerationRepository implements IGenerationRepository {
  constructor(
    @InjectRepository(GenerationEntity)
    private readonly repository: Repository<GenerationEntity>,
  ) {}

  async create(generation: Generation): Promise<void> {
    await this.repository.save(GenerationEntity.fromDomain(generation));
  }

  async findById(id: string): Promise<Generation | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? GenerationEntity.toDomain(entity) : null;
  }

  async update(generation: Generation): Promise<void> {
    await this.repository.save(GenerationEntity.fromDomain(generation));
  }
}

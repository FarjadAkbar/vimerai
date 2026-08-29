import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IBlitzConfigurationRepository } from '@/core/ports/blitz-configuration.repository';
import { BlitzConfiguration } from '@/domain/blitz-configuration.entity';
import { BlitzConfigurationEntity } from '../entities/blitz-configuration.entity';

@Injectable()
export class TypeOrmBlitzConfigurationRepository implements IBlitzConfigurationRepository {
  constructor(
    @InjectRepository(BlitzConfigurationEntity)
    private readonly repository: Repository<BlitzConfigurationEntity>,
  ) {}

  async create(configuration: BlitzConfiguration): Promise<void> {
    await this.repository.save(
      BlitzConfigurationEntity.fromDomain(configuration),
    );
  }

  async findByBrandId(brandId: string): Promise<BlitzConfiguration | null> {
    const entity = await this.repository.findOne({ where: { brandId } });
    return entity ? BlitzConfigurationEntity.toDomain(entity) : null;
  }

  async update(configuration: BlitzConfiguration): Promise<void> {
    await this.repository.save(
      BlitzConfigurationEntity.fromDomain(configuration),
    );
  }
}

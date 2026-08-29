import type { IBlitzConfigurationRepository } from '@/core/ports/blitz-configuration.repository';
import { BlitzConfiguration } from '@/domain/blitz-configuration.entity';

export class InMemoryBlitzConfigurationRepository implements IBlitzConfigurationRepository {
  private readonly items = new Map<string, BlitzConfiguration>();

  async create(configuration: BlitzConfiguration): Promise<void> {
    this.items.set(configuration.brandId, configuration);
  }

  async findByBrandId(brandId: string): Promise<BlitzConfiguration | null> {
    return this.items.get(brandId) ?? null;
  }

  async update(configuration: BlitzConfiguration): Promise<void> {
    this.items.set(configuration.brandId, configuration);
  }
}

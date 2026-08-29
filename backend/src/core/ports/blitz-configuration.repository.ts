import type { BlitzConfiguration } from '@/domain/blitz-configuration.entity';

export interface IBlitzConfigurationRepository {
  create(configuration: BlitzConfiguration): Promise<void>;
  findByBrandId(brandId: string): Promise<BlitzConfiguration | null>;
  update(configuration: BlitzConfiguration): Promise<void>;
}

import type { BrandKit } from '@/domain/brand-kit.entity';

export interface IBrandKitRepository {
  create(brandKit: BrandKit): Promise<void>;
  findById(id: string): Promise<BrandKit | null>;
  findByUserId(userId: string): Promise<BrandKit[]>;
  update(brandKit: BrandKit): Promise<void>;
}

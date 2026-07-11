import { BrandKit } from '@/domain/brand-kit.entity';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';

export class InMemoryBrandKitRepository implements IBrandKitRepository {
  private readonly items = new Map<string, BrandKit>();

  async create(brandKit: BrandKit): Promise<void> {
    this.items.set(brandKit.id, brandKit);
  }

  async findById(id: string): Promise<BrandKit | null> {
    return this.items.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<BrandKit[]> {
    return [...this.items.values()]
      .filter((kit) => kit.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(brandKit: BrandKit): Promise<void> {
    this.items.set(brandKit.id, brandKit);
  }
}

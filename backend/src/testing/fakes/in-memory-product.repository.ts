import { Product } from '@/domain/product.entity';
import type { IProductRepository } from '@/core/ports/product.repository';

export class InMemoryProductRepository implements IProductRepository {
  private readonly items = new Map<string, Product>();

  async create(product: Product): Promise<void> {
    this.items.set(product.id, product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.items.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Product[]> {
    return [...this.items.values()]
      .filter((product) => product.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(product: Product): Promise<void> {
    this.items.set(product.id, product);
  }
}

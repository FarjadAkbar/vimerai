import type { Product } from '@/domain/product.entity';

export interface IProductRepository {
  create(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findByUserId(userId: string): Promise<Product[]>;
  update(product: Product): Promise<void>;
}

import type { Product } from '@/domain/product.entity';

export interface CreateProductInput {
  name: string;
  description: string;
  imageUrls: string[];
  landingPageUrl?: string;
  price?: string | null;
  brandKitIds?: string[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  imageUrls?: string[];
  landingPageUrl?: string;
  price?: string | null;
  brandKitIds?: string[];
}

export interface IProductService {
  createProduct(
    userId: string,
    input: CreateProductInput,
  ): Promise<{ product: Product }>;
  listProducts(userId: string): Promise<{ products: Product[] }>;
  updateProduct(
    userId: string,
    id: string,
    input: UpdateProductInput,
  ): Promise<{ product: Product }>;
  uploadImage(
    userId: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ imageUrl: string }>;
}

import { KitGenerationContext, ProductKit } from '@/domain/product-kit.entity';

export interface IProductKitService {
  getActiveKit(): Promise<ProductKit>;
  getKitById(kitId: string): Promise<ProductKit | null>;
  buildGenerationContext(
    userPrompt: string,
    shotTemplateKey?: string,
  ): Promise<KitGenerationContext>;
}

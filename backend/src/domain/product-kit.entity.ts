export interface ProductKitColors {
  primary: string;
  secondary: string;
  background: string;
}

export interface ProductKitPrompt {
  brandContext: string;
  negativePrompt: string;
}

export interface ProductKitGeneration {
  preferImageConditioning: boolean;
  textToVideoModel: string;
  imageToVideoModel: string;
}

export interface ProductKitAssetRef {
  key: string;
  relativePath: string;
  mimeType: string;
  /** Public URL or data URI for AI providers */
  resolvedUrl?: string;
}

export class ProductKit {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly tagline: string,
    public readonly category: string,
    public readonly colors: ProductKitColors,
    public readonly prompt: ProductKitPrompt,
    public readonly generation: ProductKitGeneration,
    public readonly shotTemplates: Record<string, string>,
    public readonly assets: ProductKitAssetRef[],
  ) {}

  get primaryConditioningAsset(): ProductKitAssetRef | undefined {
    return this.assets.find((asset) => asset.key === 'logo');
  }
}

export interface KitGenerationContext {
  kitId: string;
  prompt: string;
  negativePrompt: string;
  productAssetUrls: string[];
  useImageConditioning: boolean;
  textToVideoModel: string;
  imageToVideoModel: string;
}

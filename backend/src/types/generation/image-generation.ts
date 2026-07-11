export interface ImageGenerationRequest {
  prompt: string;
  /** Product image URLs used as conditioning references. */
  productImageUrls: string[];
  negativePrompt?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
}

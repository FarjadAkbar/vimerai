import type { BrandKit } from '@/domain/brand-kit.entity';

export interface GenerateBusinessDnaInput {
  url: string;
}

export interface IBusinessDnaService {
  generateFromUrl(
    userId: string,
    input: GenerateBusinessDnaInput,
  ): Promise<{ brandKit: BrandKit }>;
}

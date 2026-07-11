import type { BrandKitColors } from '@/domain/brand-kit.entity';
import type { BrandKit } from '@/domain/brand-kit.entity';
import type { Tone } from '@/types/generation/enums';

export interface CreateBrandKitInput {
  name: string;
  logoUrl: string;
  colors: BrandKitColors;
  tone: Tone;
  audience: string;
  thingsToAvoid: string;
  aiInstructions?: string | null;
}

export interface UpdateBrandKitInput {
  name?: string;
  logoUrl?: string;
  colors?: BrandKitColors;
  tone?: Tone;
  audience?: string;
  thingsToAvoid?: string;
  aiInstructions?: string | null;
}

export interface IBrandKitService {
  createBrandKit(
    userId: string,
    input: CreateBrandKitInput,
  ): Promise<{ brandKit: BrandKit }>;
  listBrandKits(userId: string): Promise<{ brandKits: BrandKit[] }>;
  updateBrandKit(
    userId: string,
    id: string,
    input: UpdateBrandKitInput,
  ): Promise<{ brandKit: BrandKit }>;
  uploadLogo(
    userId: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ logoUrl: string }>;
}

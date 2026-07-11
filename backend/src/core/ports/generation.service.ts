import type {
  CreateGenerationInput,
  CreateGenerationResult,
} from '@/types/generation/generation';
import type { Generation } from '@/domain/generation.entity';

export interface IGenerationService {
  createGeneration(
    userId: string,
    input: CreateGenerationInput,
  ): Promise<CreateGenerationResult>;
  getGeneration(
    userId: string,
    generationId: string,
  ): Promise<{ generation: Generation }>;
}

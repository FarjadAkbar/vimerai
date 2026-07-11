import type {
  CreateGenerationInput,
  CreateGenerationResult,
} from '@/types/generation/generation';

/**
 * Primary application seam for Brand Kit–driven Generations.
 * Prefactor: injectable; createGeneration implemented in later tickets.
 */
export interface IGenerationService {
  createGeneration(
    userId: string,
    input: CreateGenerationInput,
  ): Promise<CreateGenerationResult>;
}

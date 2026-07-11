import type {
  CreateGenerationInput,
  CreateGenerationResult,
  ManualEditGenerationInput,
  RegenerateSectionInput,
  RetryFailedArmsInput,
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
  updateGeneration(
    userId: string,
    generationId: string,
    input: ManualEditGenerationInput,
  ): Promise<{ generation: Generation }>;
  regenerateSection(
    userId: string,
    generationId: string,
    input: RegenerateSectionInput,
  ): Promise<{ generation: Generation }>;
  retryFailedArms(
    userId: string,
    generationId: string,
    input?: RetryFailedArmsInput,
  ): Promise<{ generation: Generation }>;
}

import type {
  CreateGenerationInput,
  CreateGenerationResult,
  GenerationLibraryItem,
  ManualEditGenerationInput,
  RegenerateSectionInput,
  RegenerateShotInput,
  RenderPostConceptsInput,
  RetryFailedArmsInput,
} from '@/types/generation/generation';
import type { Generation } from '@/domain/generation.entity';

export interface IGenerationService {
  createGeneration(
    userId: string,
    input: CreateGenerationInput,
  ): Promise<CreateGenerationResult>;
  listGenerations(userId: string): Promise<{ generations: GenerationLibraryItem[] }>;
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
  regenerateShot(
    userId: string,
    generationId: string,
    input?: RegenerateShotInput,
  ): Promise<{ generation: Generation }>;
  retryFailedArms(
    userId: string,
    generationId: string,
    input?: RetryFailedArmsInput,
  ): Promise<{ generation: Generation }>;
  renderPostConcepts(
    userId: string,
    generationId: string,
    input: RenderPostConceptsInput,
  ): Promise<{ generation: Generation }>;
}

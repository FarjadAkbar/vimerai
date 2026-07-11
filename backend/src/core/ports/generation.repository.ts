import type { Generation } from '@/domain/generation.entity';

export interface IGenerationRepository {
  create(generation: Generation): Promise<void>;
  findById(id: string): Promise<Generation | null>;
  update(generation: Generation): Promise<void>;
}

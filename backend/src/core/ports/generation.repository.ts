import type { Generation } from '@/domain/generation.entity';

export interface IGenerationRepository {
  create(generation: Generation): Promise<void>;
  findById(id: string): Promise<Generation | null>;
  findByUserId(userId: string): Promise<Generation[]>;
  update(generation: Generation): Promise<void>;
}

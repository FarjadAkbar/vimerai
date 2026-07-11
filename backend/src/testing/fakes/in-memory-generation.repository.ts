import { Generation } from '@/domain/generation.entity';
import type { IGenerationRepository } from '@/core/ports/generation.repository';

export class InMemoryGenerationRepository implements IGenerationRepository {
  private readonly items = new Map<string, Generation>();

  async create(generation: Generation): Promise<void> {
    this.items.set(generation.id, generation);
  }

  async findById(id: string): Promise<Generation | null> {
    return this.items.get(id) ?? null;
  }

  async update(generation: Generation): Promise<void> {
    this.items.set(generation.id, generation);
  }
}

import type {
  IContentItemRepository,
  ListContentItemsFilter,
} from '@/core/ports/content-item.repository';
import { ContentItem } from '@/domain/content-item.entity';

export class InMemoryContentItemRepository implements IContentItemRepository {
  private readonly items = new Map<string, ContentItem>();

  async create(item: ContentItem): Promise<void> {
    this.items.set(item.id, item);
  }

  async findById(id: string): Promise<ContentItem | null> {
    return this.items.get(id) ?? null;
  }

  async findByJobId(jobId: string): Promise<ContentItem | null> {
    return (
      [...this.items.values()].find((item) => item.jobId === jobId) ?? null
    );
  }

  async findByUserId(
    userId: string,
    _filter?: ListContentItemsFilter,
  ): Promise<ContentItem[]> {
    return [...this.items.values()]
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(item: ContentItem): Promise<void> {
    this.items.set(item.id, item);
  }
}

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import type {
  CreateBrandKitInput,
  IBrandKitService,
  UpdateBrandKitInput,
} from '@/core/ports/brand-kit.service';
import type { IStorageService } from '@/core/ports/storage.service';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  STORAGE_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import { BrandKit } from '@/domain/brand-kit.entity';

@Injectable()
export class BrandKitService implements IBrandKitService {
  constructor(
    @Inject(BRAND_KIT_REPOSITORY_TOKEN)
    private readonly brandKitRepository: IBrandKitRepository,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
  ) {}

  async createBrandKit(userId: string, input: CreateBrandKitInput) {
    const brandKit = BrandKit.create(
      uuidv4(),
      userId,
      input.name,
      input.logoUrl,
      input.colors,
      input.tone,
      input.audience ?? '',
      input.thingsToAvoid ?? '',
      input.aiInstructions ?? null,
    );
    await this.brandKitRepository.create(brandKit);
    return { brandKit };
  }

  async listBrandKits(userId: string) {
    const brandKits = await this.brandKitRepository.findByUserId(userId);
    return { brandKits };
  }

  async updateBrandKit(
    userId: string,
    id: string,
    input: UpdateBrandKitInput,
  ) {
    const existing = await this.brandKitRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Brand Kit not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this Brand Kit');
    }
    const updated = existing.update(input);
    await this.brandKitRepository.update(updated);
    return { brandKit: updated };
  }

  async uploadLogo(userId: string, buffer: Buffer, contentType: string) {
    const extension =
      contentType === 'image/jpeg'
        ? 'jpg'
        : contentType === 'image/webp'
          ? 'webp'
          : 'png';
    const key = `brand-kits/${userId}/${uuidv4()}.${extension}`;
    const logoUrl = await this.storageService.upload(key, buffer, contentType);
    return { logoUrl };
  }
}

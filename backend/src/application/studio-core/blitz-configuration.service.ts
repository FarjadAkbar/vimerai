import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IBlitzConfigurationRepository } from '@/core/ports/blitz-configuration.repository';
import type {
  IBlitzConfigurationService,
  UpdateBlitzConfigurationInput,
} from '@/core/ports/blitz-configuration.service';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import {
  BLITZ_CONFIGURATION_REPOSITORY_TOKEN,
  BRAND_KIT_REPOSITORY_TOKEN,
} from '@/core/tokens/injection.tokens';
import {
  BlitzConfiguration,
  DEFAULT_BLITZ_ENABLED_FORMATS,
  type BlitzEnabledFormats,
  type MentionFrequency,
} from '@/domain/blitz-configuration.entity';

const MENTION_FREQUENCIES = new Set<MentionFrequency>([
  'never',
  'rarely',
  'sometimes',
  'often',
  'always',
]);

@Injectable()
export class BlitzConfigurationService implements IBlitzConfigurationService {
  constructor(
    @Inject(BLITZ_CONFIGURATION_REPOSITORY_TOKEN)
    private readonly blitzConfigurationRepository: IBlitzConfigurationRepository,
    @Inject(BRAND_KIT_REPOSITORY_TOKEN)
    private readonly brandKitRepository: IBrandKitRepository,
  ) {}

  async getForBrand(
    userId: string,
    brandId: string,
  ): Promise<BlitzConfiguration> {
    await this.requireOwnedBrand(userId, brandId);

    const existing =
      await this.blitzConfigurationRepository.findByBrandId(brandId);
    if (existing) {
      return existing;
    }

    const created = BlitzConfiguration.createDefault(
      uuidv4(),
      brandId,
      userId,
    );
    await this.blitzConfigurationRepository.create(created);
    return created;
  }

  async updateForBrand(
    userId: string,
    brandId: string,
    input: UpdateBlitzConfigurationInput,
  ): Promise<BlitzConfiguration> {
    await this.requireOwnedBrand(userId, brandId);
    this.validateInput(input);

    const current = await this.getForBrand(userId, brandId);
    const updated = current.withUpdates({
      mentionFrequency: input.mentionFrequency,
      showInfluencerMaterials: input.showInfluencerMaterials,
      enabledFormats: input.enabledFormats,
    });
    await this.blitzConfigurationRepository.update(updated);
    return updated;
  }

  private validateInput(input: UpdateBlitzConfigurationInput) {
    if (!MENTION_FREQUENCIES.has(input.mentionFrequency)) {
      throw new BadRequestException('Invalid mention frequency');
    }

    const enabledCount = Object.values(input.enabledFormats).filter(Boolean)
      .length;
    if (enabledCount === 0) {
      throw new BadRequestException(
        'At least one Blitz content type must stay enabled',
      );
    }

    for (const slug of Object.keys(DEFAULT_BLITZ_ENABLED_FORMATS)) {
      if (!(slug in input.enabledFormats)) {
        throw new BadRequestException(`Missing enabledFormats.${slug}`);
      }
    }
  }

  private async requireOwnedBrand(userId: string, brandId: string) {
    const brand = await this.brandKitRepository.findById(brandId);
    if (!brand || brand.userId !== userId) {
      throw new ForbiddenException('Brand not found');
    }
  }
}

export function normalizeEnabledFormats(
  enabledFormats: BlitzEnabledFormats,
): BlitzEnabledFormats {
  return {
    slideshow: Boolean(enabledFormats.slideshow),
    'wall-of-text': Boolean(enabledFormats['wall-of-text']),
    'hook-demo': Boolean(enabledFormats['hook-demo']),
    'green-screen': Boolean(enabledFormats['green-screen']),
  };
}

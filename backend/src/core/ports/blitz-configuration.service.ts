import type {
  BlitzConfiguration,
  BlitzEnabledFormats,
  MentionFrequency,
} from '@/domain/blitz-configuration.entity';

export interface UpdateBlitzConfigurationInput {
  mentionFrequency: MentionFrequency;
  showInfluencerMaterials: boolean;
  enabledFormats: BlitzEnabledFormats;
}

export interface IBlitzConfigurationService {
  getForBrand(userId: string, brandId: string): Promise<BlitzConfiguration>;
  updateForBrand(
    userId: string,
    brandId: string,
    input: UpdateBlitzConfigurationInput,
  ): Promise<BlitzConfiguration>;
}

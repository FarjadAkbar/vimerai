import type { BlitzConfiguration } from '@/domain/blitz-configuration.entity';

export type BlitzConfigurationResponse = {
  brandId: string;
  mentionFrequency: BlitzConfiguration['mentionFrequency'];
  showInfluencerMaterials: boolean;
  enabledFormats: BlitzConfiguration['enabledFormats'];
  createdAt: string;
  updatedAt: string;
};

export function toBlitzConfigurationResponse(
  configuration: BlitzConfiguration,
): BlitzConfigurationResponse {
  return {
    brandId: configuration.brandId,
    mentionFrequency: configuration.mentionFrequency,
    showInfluencerMaterials: configuration.showInfluencerMaterials,
    enabledFormats: configuration.enabledFormats,
    createdAt: configuration.createdAt.toISOString(),
    updatedAt: configuration.updatedAt.toISOString(),
  };
}

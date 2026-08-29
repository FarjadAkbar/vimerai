import { Module } from '@nestjs/common';
import { TemplateCatalogService } from '@/application/studio-core/template-catalog.service';
import { TemplateGenerationService } from '@/application/studio-core/template-generation.service';
import { MediaAssetService } from '@/application/studio-core/media-asset.service';
import { MediaAssetsController } from '@/application/studio-core/media-assets.controller';
import { AiInfluencersController } from '@/application/studio-core/ai-influencers.controller';
import { AiInfluencerService } from '@/application/studio-core/ai-influencer.service';
import { BlitzConfigurationService } from '@/application/studio-core/blitz-configuration.service';
import { JobService } from '@/application/studio-core/job.service';
import { ContentLibraryService } from '@/application/studio-core/content-library.service';
import { ContentLibraryController } from '@/application/studio-core/content-library.controller';
import { ViralRemixService } from '@/application/studio-core/viral-remix.service';
import { ViralRemixController } from '@/application/studio-core/viral-remix.controller';
import { BlitzComposeService } from '@/application/studio-core/blitz-compose.service';
import { BlitzComposeController } from '@/application/studio-core/blitz-compose.controller';
import { AiImageService } from '@/application/studio-core/ai-image.service';
import { AiImagesController } from '@/application/studio-core/ai-images.controller';
import { InfluencerImageService } from '@/application/studio-core/influencer-image.service';
import { InfluencerVideoService } from '@/application/studio-core/influencer-video.service';
import { ImageGenerationModule } from '@/infrastructure/image-generation/image-generation.module';
import {
  BLITZ_CONFIGURATION_REPOSITORY_TOKEN,
  BLITZ_CONFIGURATION_SERVICE_TOKEN,
  AI_INFLUENCER_REPOSITORY_TOKEN,
  AI_INFLUENCER_SERVICE_TOKEN,
  BRAND_KIT_REPOSITORY_TOKEN,
  CONTENT_ITEM_REPOSITORY_TOKEN,
  CONTENT_LIBRARY_TOKEN,
  JOB_REPOSITORY_TOKEN,
  JOB_SERVICE_TOKEN,
  MEDIA_ASSET_REPOSITORY_TOKEN,
  MEDIA_ASSET_SERVICE_TOKEN,
  TEMPLATE_CATALOG_TOKEN,
  TEMPLATE_REPOSITORY_TOKEN,
  FORMAT_CATALOG_TOKEN,
} from '@/core/tokens/injection.tokens';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { StorageModule } from '@/infrastructure/storage/storage.module';
import { VideoGenerationModule } from '@/infrastructure/video-generation/video-generation.module';
import { SubscriptionModule } from '@/application/subscription/subscription.module';
import { CuratedFormatCatalog } from '@/infrastructure/formats/curated-format.catalog';
import { TypeOrmContentItemRepository } from '@/infrastructure/persistence/typeorm/repositories/content-item.repository';
import { TypeOrmJobRepository } from '@/infrastructure/persistence/typeorm/repositories/job.repository';
import { TypeOrmMediaAssetRepository } from '@/infrastructure/persistence/typeorm/repositories/media-asset.repository';
import { TypeOrmTemplateRepository } from '@/infrastructure/persistence/typeorm/repositories/template.repository';
import { TypeOrmBlitzConfigurationRepository } from '@/infrastructure/persistence/typeorm/repositories/blitz-configuration.repository';
import { TypeOrmBrandKitRepository } from '@/infrastructure/persistence/typeorm/repositories/brand-kit.repository';
import { TypeOrmAiInfluencerRepository } from '@/infrastructure/persistence/typeorm/repositories/ai-influencer.repository';

@Module({
  imports: [
    DatabaseModule,
    StorageModule,
    VideoGenerationModule,
    ImageGenerationModule,
    SubscriptionModule,
  ],
  controllers: [
    MediaAssetsController,
    AiInfluencersController,
    ViralRemixController,
    ContentLibraryController,
    BlitzComposeController,
    AiImagesController,
  ],
  providers: [
    TemplateCatalogService,
    TemplateGenerationService,
    MediaAssetService,
    JobService,
    ContentLibraryService,
    BlitzConfigurationService,
    AiInfluencerService,
    ViralRemixService,
    BlitzComposeService,
    InfluencerImageService,
    InfluencerVideoService,
    AiImageService,
    CuratedFormatCatalog,
    {
      provide: TEMPLATE_REPOSITORY_TOKEN,
      useClass: TypeOrmTemplateRepository,
    },
    {
      provide: MEDIA_ASSET_REPOSITORY_TOKEN,
      useClass: TypeOrmMediaAssetRepository,
    },
    {
      provide: JOB_REPOSITORY_TOKEN,
      useClass: TypeOrmJobRepository,
    },
    {
      provide: CONTENT_ITEM_REPOSITORY_TOKEN,
      useClass: TypeOrmContentItemRepository,
    },
    {
      provide: BLITZ_CONFIGURATION_REPOSITORY_TOKEN,
      useClass: TypeOrmBlitzConfigurationRepository,
    },
    {
      provide: AI_INFLUENCER_REPOSITORY_TOKEN,
      useClass: TypeOrmAiInfluencerRepository,
    },
    {
      provide: BRAND_KIT_REPOSITORY_TOKEN,
      useClass: TypeOrmBrandKitRepository,
    },
    {
      provide: TEMPLATE_CATALOG_TOKEN,
      useExisting: TemplateCatalogService,
    },
    {
      provide: MEDIA_ASSET_SERVICE_TOKEN,
      useExisting: MediaAssetService,
    },
    {
      provide: JOB_SERVICE_TOKEN,
      useExisting: JobService,
    },
    {
      provide: CONTENT_LIBRARY_TOKEN,
      useExisting: ContentLibraryService,
    },
    {
      provide: BLITZ_CONFIGURATION_SERVICE_TOKEN,
      useExisting: BlitzConfigurationService,
    },
    {
      provide: AI_INFLUENCER_SERVICE_TOKEN,
      useExisting: AiInfluencerService,
    },
    {
      provide: FORMAT_CATALOG_TOKEN,
      useExisting: CuratedFormatCatalog,
    },
  ],
  exports: [
    TEMPLATE_CATALOG_TOKEN,
    TemplateGenerationService,
    BLITZ_CONFIGURATION_SERVICE_TOKEN,
    BlitzConfigurationService,
    MEDIA_ASSET_SERVICE_TOKEN,
    JOB_SERVICE_TOKEN,
    CONTENT_LIBRARY_TOKEN,
    TEMPLATE_REPOSITORY_TOKEN,
    MEDIA_ASSET_REPOSITORY_TOKEN,
    JOB_REPOSITORY_TOKEN,
    CONTENT_ITEM_REPOSITORY_TOKEN,
    AI_INFLUENCER_SERVICE_TOKEN,
    AI_INFLUENCER_REPOSITORY_TOKEN,
  ],
})
export class StudioCoreModule {}

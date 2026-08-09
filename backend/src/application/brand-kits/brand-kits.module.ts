import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrandKitsController } from '@/application/brand-kits/brand-kits.controller';
import { BrandKitService } from '@/application/brand-kits/brand-kit.service';
import { BusinessDnaService } from '@/application/brand-kits/business-dna.service';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  BRAND_KIT_SERVICE_TOKEN,
  BUSINESS_DNA_EXTRACTOR_TOKEN,
  BUSINESS_DNA_SERVICE_TOKEN,
  HOMEPAGE_SCRAPE_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import { OpenAiBusinessDnaExtractor } from '@/infrastructure/ai/openai-business-dna-extractor';
import openaiConfig from '@/infrastructure/config/openai.config';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmBrandKitRepository } from '@/infrastructure/persistence/typeorm/repositories/brand-kit.repository';
import { HtmlHomepageScrapeProvider } from '@/infrastructure/scrape/html-homepage-scrape.provider';
import { StorageModule } from '@/infrastructure/storage/storage.module';

@Module({
  imports: [
    DatabaseModule,
    StorageModule,
    ConfigModule.forFeature(openaiConfig),
  ],
  controllers: [BrandKitsController],
  providers: [
    BrandKitService,
    BusinessDnaService,
    HtmlHomepageScrapeProvider,
    OpenAiBusinessDnaExtractor,
    {
      provide: BRAND_KIT_SERVICE_TOKEN,
      useExisting: BrandKitService,
    },
    {
      provide: BRAND_KIT_REPOSITORY_TOKEN,
      useClass: TypeOrmBrandKitRepository,
    },
    {
      provide: HOMEPAGE_SCRAPE_PROVIDER_TOKEN,
      useExisting: HtmlHomepageScrapeProvider,
    },
    {
      provide: BUSINESS_DNA_EXTRACTOR_TOKEN,
      useExisting: OpenAiBusinessDnaExtractor,
    },
    {
      provide: BUSINESS_DNA_SERVICE_TOKEN,
      useExisting: BusinessDnaService,
    },
  ],
  exports: [
    BRAND_KIT_SERVICE_TOKEN,
    BUSINESS_DNA_SERVICE_TOKEN,
    BrandKitService,
    BusinessDnaService,
  ],
})
export class BrandKitsModule {}

import { Module } from '@nestjs/common';
import { BrandKitsController } from '@/application/brand-kits/brand-kits.controller';
import { BrandKitService } from '@/application/brand-kits/brand-kit.service';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  BRAND_KIT_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmBrandKitRepository } from '@/infrastructure/persistence/typeorm/repositories/brand-kit.repository';
import { StorageModule } from '@/infrastructure/storage/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [BrandKitsController],
  providers: [
    BrandKitService,
    {
      provide: BRAND_KIT_SERVICE_TOKEN,
      useExisting: BrandKitService,
    },
    {
      provide: BRAND_KIT_REPOSITORY_TOKEN,
      useClass: TypeOrmBrandKitRepository,
    },
  ],
  exports: [BRAND_KIT_SERVICE_TOKEN, BrandKitService],
})
export class BrandKitsModule {}

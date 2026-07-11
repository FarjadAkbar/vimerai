import { Module } from '@nestjs/common';
import { KitsController } from '@/application/kits/kits.controller';
import { FileProductKitService } from '@/infrastructure/kit/file-product-kit.service';
import { StorageModule } from '@/infrastructure/storage/storage.module';
import { PRODUCT_KIT_SERVICE_TOKEN } from '@/core/tokens/injection.tokens';

@Module({
  imports: [StorageModule],
  controllers: [KitsController],
  providers: [
    FileProductKitService,
    {
      provide: PRODUCT_KIT_SERVICE_TOKEN,
      useExisting: FileProductKitService,
    },
  ],
  exports: [PRODUCT_KIT_SERVICE_TOKEN, FileProductKitService],
})
export class KitsModule {}

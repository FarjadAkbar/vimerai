import { Module } from '@nestjs/common';
import { ProductService } from '@/application/products/product.service';
import { ProductsController } from '@/application/products/products.controller';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  PRODUCT_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmBrandKitRepository } from '@/infrastructure/persistence/typeorm/repositories/brand-kit.repository';
import { TypeOrmProductRepository } from '@/infrastructure/persistence/typeorm/repositories/product.repository';
import { StorageModule } from '@/infrastructure/storage/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [ProductsController],
  providers: [
    ProductService,
    {
      provide: PRODUCT_SERVICE_TOKEN,
      useExisting: ProductService,
    },
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: TypeOrmProductRepository,
    },
    {
      provide: BRAND_KIT_REPOSITORY_TOKEN,
      useClass: TypeOrmBrandKitRepository,
    },
  ],
  exports: [PRODUCT_SERVICE_TOKEN, ProductService],
})
export class ProductsModule {}

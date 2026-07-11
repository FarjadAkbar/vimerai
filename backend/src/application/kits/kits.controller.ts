import { Controller, Get, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { IProductKitService } from '@/core/ports/product-kit.service';
import { PRODUCT_KIT_SERVICE_TOKEN } from '@/core/tokens/injection.tokens';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@Controller('kits')
@UseGuards(JwtAuthGuard)
export class KitsController {
  constructor(
    @Inject(PRODUCT_KIT_SERVICE_TOKEN)
    private readonly productKitService: IProductKitService,
  ) {}

  @Get('active')
  async getActiveKit() {
    const kit = await this.productKitService.getActiveKit();
    return {
      id: kit.id,
      name: kit.name,
      tagline: kit.tagline,
      category: kit.category,
      colors: kit.colors,
      shotTemplates: Object.keys(kit.shotTemplates),
      assets: kit.assets.map((asset) => ({
        key: asset.key,
        url: asset.resolvedUrl,
      })),
    };
  }
}

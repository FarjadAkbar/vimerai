import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { IFormatCatalog } from '@/core/ports/format.catalog';
import { FORMAT_CATALOG_TOKEN } from '@/core/tokens/injection.tokens';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { isFormatListMode } from '@/types/format/format';

@Controller('formats')
@UseGuards(JwtAuthGuard)
export class FormatsController {
  constructor(
    @Inject(FORMAT_CATALOG_TOKEN)
    private readonly formatCatalog: IFormatCatalog,
  ) {}

  @Get()
  list(@Query('modality') modality?: string) {
    if (modality == null || !isFormatListMode(modality)) {
      throw new BadRequestException(
        'Query modality must be "post" or "video"',
      );
    }
    return {
      formats: this.formatCatalog.listByModality(modality),
    };
  }
}

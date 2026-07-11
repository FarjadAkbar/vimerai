import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BrandKitService } from '@/application/brand-kits/brand-kit.service';
import {
  CreateBrandKitDto,
  UpdateBrandKitDto,
} from '@/application/brand-kits/dto/brand-kit.dto';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@Controller('brand-kits')
@UseGuards(JwtAuthGuard)
export class BrandKitsController {
  constructor(private readonly brandKitService: BrandKitService) {}

  @Get()
  async list(@CurrentUser() user: { userId: string }) {
    return this.brandKitService.listBrandKits(user.userId);
  }

  @Post('logo')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadLogo(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Logo file is required');
    }
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Logo must be PNG, JPEG, or WebP');
    }
    return this.brandKitService.uploadLogo(
      user.userId,
      file.buffer,
      file.mimetype,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: { userId: string },
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CreateBrandKitDto,
  ) {
    return this.brandKitService.createBrandKit(user.userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: UpdateBrandKitDto,
  ) {
    return this.brandKitService.updateBrandKit(user.userId, id, dto);
  }
}

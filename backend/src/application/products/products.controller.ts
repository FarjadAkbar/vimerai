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
import { ProductScrapeService } from '@/application/products/product-scrape.service';
import { ProductService } from '@/application/products/product.service';
import { ScrapeProductDto } from '@/application/products/dto/product-scrape.dto';
import {
  CreateProductDto,
  UpdateProductDto,
} from '@/application/products/dto/product.dto';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly productService: ProductService,
    private readonly productScrapeService: ProductScrapeService,
  ) {}

  @Get()
  async list(@CurrentUser() user: { userId: string }) {
    return this.productService.listProducts(user.userId);
  }

  @Post('scrape')
  @HttpCode(HttpStatus.OK)
  async scrape(
    @CurrentUser() user: { userId: string },
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: ScrapeProductDto,
  ) {
    return this.productScrapeService.scrapePreview(user.userId, {
      url: dto.url,
    });
  }

  @Post('images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Product image file is required');
    }
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Image must be PNG, JPEG, or WebP');
    }
    return this.productService.uploadImage(
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
    dto: CreateProductDto,
  ) {
    return this.productService.createProduct(user.userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(user.userId, id, dto);
  }
}

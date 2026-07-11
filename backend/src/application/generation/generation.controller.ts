import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GenerationService } from '@/application/generation/generation.service';
import { CreateGenerationDto } from '@/application/generation/dto/create-generation.dto';
import { ManualEditGenerationDto } from '@/application/generation/dto/manual-edit-generation.dto';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@Controller('generations')
@UseGuards(JwtAuthGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: { userId: string },
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CreateGenerationDto,
  ) {
    return this.generationService.createGeneration(user.userId, dto);
  }

  @Get(':id')
  async get(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.generationService.getGeneration(user.userId, id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: ManualEditGenerationDto,
  ) {
    return this.generationService.updateGeneration(user.userId, id, dto);
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GenerationService } from '@/application/generation/generation.service';
import { CreateGenerationDto } from '@/application/generation/dto/create-generation.dto';
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
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { CreatePromptTemplateDto } from '../videos/dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from '../videos/dto/update-prompt-template.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';

@Controller('prompts')
@UseGuards(JwtAuthGuard)
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Get()
  async getPrompts(@CurrentUser() user: { userId: string }) {
    return this.promptsService.getUserTemplates(user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPrompt(
    @CurrentUser() user: { userId: string },
    @Body(ValidationPipe) dto: CreatePromptTemplateDto,
  ) {
    return this.promptsService.createTemplate(user.userId, dto);
  }

  @Put(':id')
  async updatePrompt(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdatePromptTemplateDto,
  ) {
    return this.promptsService.updateTemplate(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePrompt(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.promptsService.deleteTemplate(user.userId, id);
  }
}


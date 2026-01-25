import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IPromptTemplateRepository } from '@/core/ports/prompt-template.repository';
import { PromptTemplate } from '@/domain/prompt-template.entity';
import { CreatePromptTemplateDto } from '../videos/dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from '../videos/dto/update-prompt-template.dto';

@Injectable()
export class PromptsService {
  constructor(
    @Inject('IPromptTemplateRepository')
    private readonly templateRepository: IPromptTemplateRepository,
  ) {}

  async getUserTemplates(userId: string) {
    const templates =
      await this.templateRepository.getTemplatesByUserId(userId);
    return { prompts: templates };
  }

  async createTemplate(userId: string, dto: CreatePromptTemplateDto) {
    const template = PromptTemplate.create(
      uuidv4(),
      userId,
      dto.name,
      dto.template,
    );
    await this.templateRepository.createTemplate(template);
    return { prompt: template };
  }

  async updateTemplate(
    userId: string,
    id: string,
    dto: UpdatePromptTemplateDto,
  ) {
    const template = await this.templateRepository.getTemplateById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    if (template.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this template');
    }
    const updated = template.update(dto.name, dto.template);
    await this.templateRepository.updateTemplate(updated);
    return { prompt: updated };
  }

  async deleteTemplate(userId: string, id: string) {
    const template = await this.templateRepository.getTemplateById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    if (template.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this template');
    }
    await this.templateRepository.deleteTemplate(id);
    return { message: 'Template deleted successfully' };
  }
}

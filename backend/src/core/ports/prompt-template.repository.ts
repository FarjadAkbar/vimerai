import { PromptTemplate } from '@/domain/prompt-template.entity';

export interface IPromptTemplateRepository {
  createTemplate(template: PromptTemplate): Promise<void>;
  getTemplateById(id: string): Promise<PromptTemplate | null>;
  getTemplatesByUserId(userId: string): Promise<PromptTemplate[]>;
  updateTemplate(template: PromptTemplate): Promise<void>;
  deleteTemplate(id: string): Promise<void>;
}


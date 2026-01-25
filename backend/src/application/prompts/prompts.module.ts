import { Module } from '@nestjs/common';
import { PromptsController } from './prompts.controller';
import { PromptsService } from './prompts.service';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmPromptTemplateRepository } from '@/infrastructure/persistence/typeorm/repositories/prompt-template.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [PromptsController],
  providers: [
    PromptsService,
    {
      provide: 'IPromptTemplateRepository',
      useClass: TypeOrmPromptTemplateRepository,
    },
  ],
})
export class PromptsModule {}

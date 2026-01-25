import { IsString } from 'class-validator';

export class CreatePromptTemplateDto {
  @IsString()
  name: string;

  @IsString()
  template: string;
}

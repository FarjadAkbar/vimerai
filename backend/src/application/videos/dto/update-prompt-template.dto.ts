import { IsString, IsOptional } from 'class-validator';

export class UpdatePromptTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  template?: string;
}


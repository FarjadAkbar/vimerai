import { IsString } from 'class-validator';

export class GeneratePreviewDto {
  @IsString()
  prompt: string;
}


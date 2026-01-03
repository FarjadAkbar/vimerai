import { IsString, IsOptional, IsEnum } from 'class-validator';
import { GenerationMode } from '@/domain/video.entity';

export class GenerateVideoDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsEnum(GenerationMode)
  mode?: GenerationMode;
}


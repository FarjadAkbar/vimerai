import { IsString, IsOptional, IsEnum, IsIn } from 'class-validator';
import { GenerationMode } from '@/domain/video.entity';

const NITRO_SHINE_SHOTS = ['hero', 'website', 'lifestyle'] as const;

export class GenerateVideoDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsEnum(GenerationMode)
  mode?: GenerationMode;

  /** Optional shot template from active kit manifest (nitro-shine). */
  @IsOptional()
  @IsIn(NITRO_SHINE_SHOTS)
  shotTemplate?: (typeof NITRO_SHINE_SHOTS)[number];
}

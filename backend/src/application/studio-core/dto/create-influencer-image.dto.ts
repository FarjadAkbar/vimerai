import { IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateInfluencerImageDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  referenceMediaAssetIds?: string[];
}

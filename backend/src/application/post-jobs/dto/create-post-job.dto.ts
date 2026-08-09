import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePostJobDto {
  @IsUUID()
  brandId: string;

  @IsUUID()
  productId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  formatId: string;
}

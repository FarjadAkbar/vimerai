import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({ require_tld: false }, { each: true })
  imageUrls: string[];

  @IsOptional()
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsUrl({ require_tld: false })
  landingPageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  price?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  brandKitIds?: string[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({ require_tld: false }, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsUrl({ require_tld: false })
  landingPageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  price?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  brandKitIds?: string[];
}

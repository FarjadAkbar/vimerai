import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class GenerateBusinessDnaDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  url: string;
}

import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class ScrapeProductDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  url: string;
}

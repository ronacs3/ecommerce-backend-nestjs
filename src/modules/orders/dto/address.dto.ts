import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddressDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  address: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  postalCode?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;
}

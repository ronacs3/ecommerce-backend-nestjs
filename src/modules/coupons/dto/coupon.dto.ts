import { ArrayMaxSize, IsArray, IsISO8601, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CouponDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  discount: number;

  @IsISO8601()
  expirationDate: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  applicableCategories?: string[];
}

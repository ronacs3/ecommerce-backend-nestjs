import { ArrayMaxSize, IsArray, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CategoryDto } from '../../categories/dto/category.dto';

export class ProductDto extends CategoryDto {
  @IsString()
  @MinLength(1)
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  image?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  images?: string[];

  @IsNumber()
  @Min(0)
  @Max(1e12)
  price: number;

  @IsInt()
  @Min(0)
  @Max(1000000)
  countInStock: number;
}

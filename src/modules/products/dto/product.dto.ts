import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryDto } from '../../categories/dto/category.dto';

export class ProductDto extends CategoryDto {
  @ApiProperty({
    example: 'Điện thoại',
    description: 'Tên danh mục sản phẩm (phải tồn tại trong hệ thống)',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  category: string;

  @ApiPropertyOptional({
    example: 'Apple',
    description: 'Thương hiệu của sản phẩm',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:5000/uploads/sample-product.jpg',
    description: 'URL ảnh đại diện chính của sản phẩm',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  image?: string;

  @ApiPropertyOptional({
    example: [
      'http://localhost:5000/uploads/sample-1.jpg',
      'http://localhost:5000/uploads/sample-2.jpg',
    ],
    description: 'Danh sách các ảnh phụ của sản phẩm (tối đa 20 ảnh)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    example: 29990000,
    description: 'Giá niêm yết của sản phẩm (VNĐ)',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(1e12)
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Số lượng sản phẩm còn trong kho hàng',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Max(1000000)
  countInStock: number;
}

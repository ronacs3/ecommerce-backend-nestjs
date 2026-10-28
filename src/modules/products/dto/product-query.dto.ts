import { IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductQueryDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo tên hoặc mô tả sản phẩm (tối đa 200 ký tự)',
    example: 'iPhone',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Lọc sản phẩm theo tên danh mục chính xác',
    example: 'Điện thoại',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Giá bán tối thiểu (VNĐ)',
    example: '10000000',
  })
  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @ApiPropertyOptional({
    description: 'Giá bán tối đa (VNĐ)',
    example: '35000000',
  })
  @IsOptional()
  @IsNumberString()
  maxPrice?: string;
}

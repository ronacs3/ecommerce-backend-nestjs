import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({
    example: 'Điện thoại',
    description: 'Tên danh mục sản phẩm (duy nhất trong hệ thống)',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Các dòng điện thoại thông minh, smartphone chính hãng mới nhất',
    description: 'Mô tả chi tiết về danh mục sản phẩm (tối đa 2000 ký tự)',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

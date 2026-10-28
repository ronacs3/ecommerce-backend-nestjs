import {
  ArrayMaxSize,
  IsArray,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CouponDto {
  @ApiProperty({
    example: 'SUMMER2026',
    description: 'Mã giảm giá khuyến mãi (tự động chuyển thành chữ hoa)',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 15,
    description: 'Phần trăm giảm giá (từ 1% đến 100%)',
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  discount: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Thời gian hết hạn của mã (định dạng ISO 8601 hoặc YYYY-MM-DD)',
  })
  @IsISO8601()
  expirationDate: string;

  @ApiPropertyOptional({
    example: ['Điện thoại', 'Laptop'],
    description:
      'Danh sách tên danh mục được áp dụng mã. Để trống mảng sẽ áp dụng cho tất cả mặt hàng.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  applicableCategories?: string[];
}

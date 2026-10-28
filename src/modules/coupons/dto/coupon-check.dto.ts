import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CartItemCheckDto {
  @ApiProperty({
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
    description: 'UUID của sản phẩm',
    required: false,
  })
  @IsOptional()
  @IsString()
  product?: string;

  @ApiProperty({
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
    description: 'UUID của sản phẩm (tương thích cả 2 chuẩn field _id và product)',
    required: false,
  })
  @IsOptional()
  @IsString()
  _id?: string;
}

export class CouponCheckDto {
  @ApiProperty({
    example: 'SUMMER2026',
    description: 'Mã giảm giá cần kiểm tra tính hợp lệ',
  })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    type: [CartItemCheckDto],
    description: 'Danh sách sản phẩm trong giỏ hàng để kiểm tra danh mục áp dụng',
    example: [{ product: 'a587989f-22a0-4a81-b552-32b7816d56df' }],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  cartItems: CartItemCheckDto[];
}

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemDto } from './item.dto';
import { AddressDto } from './address.dto';

export class OrderDto {
  @ApiProperty({
    type: [ItemDto],
    description: 'Danh sách các mặt hàng và số lượng cần đặt mua',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  orderItems: ItemDto[];

  @ApiProperty({
    type: AddressDto,
    description: 'Địa chỉ và thông tin nhận hàng của khách hàng',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ApiProperty({
    example: 'COD',
    enum: ['COD', 'PayPal', 'BankTransfer', 'VNPAY', 'Cash', 'CreditCard'],
    description: 'Phương thức thanh toán đã lựa chọn',
  })
  @IsString()
  @IsIn(['COD', 'PayPal', 'BankTransfer', 'VNPAY', 'Cash', 'CreditCard'])
  paymentMethod: string;

  @ApiPropertyOptional({
    example: 'SUMMER2026',
    description: 'Mã giảm giá coupon nếu có áp dụng',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  couponCode?: string;
}

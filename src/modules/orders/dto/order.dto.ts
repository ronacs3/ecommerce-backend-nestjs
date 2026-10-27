import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ItemDto } from './item.dto';
import { AddressDto } from './address.dto';

export class OrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  orderItems: ItemDto[];

  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsString()
  @IsIn(['COD', 'PayPal', 'BankTransfer', 'VNPAY', 'Cash', 'CreditCard'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  couponCode?: string;
}

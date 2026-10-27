import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, MaxLength } from 'class-validator';

export class CouponCheckDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  cartItems: { _id?: string; product?: string }[];
}

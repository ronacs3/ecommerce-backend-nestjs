import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({
    example: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1',
    description: 'Địa chỉ chi tiết nhận hàng (số nhà, tên đường, phường/xã)',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  address: string;

  @ApiProperty({
    example: 'Hồ Chí Minh',
    description: 'Tỉnh / Thành phố nhận hàng',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({
    example: '700000',
    description: 'Mã bưu chính (Postal Code)',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  postalCode?: string;

  @ApiProperty({
    example: 'Việt Nam',
    description: 'Quốc gia',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({
    example: '0901234567',
    description: 'Số điện thoại liên hệ nhận hàng',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên người nhận hàng',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;
}

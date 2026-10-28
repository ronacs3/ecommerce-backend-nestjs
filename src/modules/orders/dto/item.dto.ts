import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ItemDto {
  @ApiProperty({
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
    description: 'UUID của sản phẩm cần mua',
  })
  @IsUUID()
  product: string;

  @ApiProperty({
    example: 2,
    description: 'Số lượng mua (từ 1 đến 10000)',
    minimum: 1,
    maximum: 10000,
  })
  @IsInt()
  @Min(1)
  @Max(10000)
  qty: number;
}

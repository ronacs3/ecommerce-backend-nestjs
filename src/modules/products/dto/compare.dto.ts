import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CompareProductItemDto {
  @ApiProperty({
    example: 'a587989f-22a0-4a81-b552-32b7816d56df',
    description: 'UUID của sản phẩm',
  })
  @IsUUID()
  _id: string;
}

export class CompareDto {
  @ApiProperty({
    type: [CompareProductItemDto],
    description: 'Danh sách từ 2 đến 4 sản phẩm cần gửi tới AI so sánh',
    example: [
      { _id: 'a587989f-22a0-4a81-b552-32b7816d56df' },
      { _id: 'b6e8281a-33b1-4b92-c663-43c8927e67ea' },
    ],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => CompareProductItemDto)
  products: CompareProductItemDto[];
}

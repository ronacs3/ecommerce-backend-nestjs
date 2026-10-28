import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Điểm số đánh giá từ 1 đến 5 sao',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Sản phẩm đóng gói rất cẩn thận, dùng mượt mà và đúng như mô tả!',
    description: 'Nội dung nhận xét chi tiết (tối đa 3000 ký tự)',
    minLength: 1,
    maxLength: 3000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  comment: string;
}

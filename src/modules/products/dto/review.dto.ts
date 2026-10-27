import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class ReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  comment: string;
}

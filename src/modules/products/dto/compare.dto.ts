import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator';

export class CompareDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  products: { _id: string }[];
}

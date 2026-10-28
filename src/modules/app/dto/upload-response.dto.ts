import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    example: 'http://localhost:5000/uploads/d3b07384-d113-4001-9a7f-7a4c7e6c4013.jpg',
    description: 'Đường dẫn URL công khai của hình ảnh vừa tải lên thành công',
  })
  image: string;
}

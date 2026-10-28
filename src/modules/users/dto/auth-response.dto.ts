import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'd3b07384-d113-4001-9a7f-7a4c7e6c4013',
    description: 'UUID định danh duy nhất của người dùng',
  })
  _id: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên của người dùng',
  })
  name: string;

  @ApiProperty({
    example: 'customer@example.com',
    description: 'Địa chỉ email đã đăng ký',
  })
  email: string;

  @ApiProperty({
    example: false,
    description: 'Xác định quyền quản trị viên (Admin) hay khách hàng',
  })
  isAdmin: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Bearer Access Token (hiệu lực 7 ngày)',
  })
  token: string;
}

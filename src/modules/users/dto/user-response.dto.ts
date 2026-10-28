import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'd3b07384-d113-4001-9a7f-7a4c7e6c4013',
    description: 'UUID định danh của người dùng',
  })
  _id: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên',
  })
  name: string;

  @ApiProperty({
    example: 'customer@example.com',
    description: 'Địa chỉ email',
  })
  email: string;

  @ApiProperty({
    example: false,
    description: 'Quyền quản trị viên (Admin)',
  })
  isAdmin: boolean;

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description: 'Thời điểm tạo tài khoản',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-15T08:30:00.000Z',
    description: 'Thời điểm cập nhật tài khoản gần nhất',
  })
  updatedAt: Date;
}

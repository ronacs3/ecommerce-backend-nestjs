import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Trạng thái hoạt động của dịch vụ' })
  status: string;

  @ApiProperty({ example: 'postgresql', description: 'Trạng thái kết nối cơ sở dữ liệu' })
  database: string;
}

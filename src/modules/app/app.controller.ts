import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { readFile, unlink } from 'fs/promises';
import { Public, Admin } from '../../common/decorators';
import { ErrorResponseDto } from '../../common/dto';
import { MessageDto, HealthResponseDto, UploadResponseDto } from './dto';

@ApiTags('System & Uploads')
@Controller()
export class AppController {
  constructor(private readonly db: DataSource) {}

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Kiểm tra trạng thái hệ thống và kết nối cơ sở dữ liệu',
    description:
      'Thực hiện truy vấn SQL SELECT 1 tới cơ sở dữ liệu PostgreSQL để xác minh tính sẵn sàng và ổn định của máy chủ.',
  })
  @ApiResponse({
    status: 200,
    description: 'Hệ thống và cơ sở dữ liệu hoạt động bình thường',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi kết nối cơ sở dữ liệu',
    type: ErrorResponseDto,
  })
  async health() {
    await this.db.query('SELECT 1');
    return { status: 'ok', database: 'postgresql' };
  }

  @ApiBearerAuth('JWT-auth')
  @Post('chat')
  @ApiOperation({
    summary: 'Gửi tin nhắn tư vấn tới AI Assistant',
    description:
      'Gửi nội dung câu hỏi hoặc yêu cầu tư vấn mua hàng tới trợ lý ảo trí tuệ nhân tạo (tính năng đang chuẩn bị cấu hình nhà cung cấp).',
  })
  @ApiBody({
    type: MessageDto,
    examples: {
      default: {
        summary: 'Tin nhắn hỏi tư vấn sản phẩm',
        value: {
          message:
            'Tư vấn cho tôi các sản phẩm điện thoại dưới 15 triệu tốt nhất hiện nay',
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Chưa cấu hình nhà cung cấp AI cho chatbot',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  chat(@Body() _b: MessageDto) {
    throw new ServiceUnavailableException(
      'Chưa cấu hình nhà cung cấp AI cho chatbot',
    );
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Post('upload')
  @ApiOperation({
    summary: 'Tải lên hình ảnh sản phẩm (Chỉ dành cho Admin)',
    description:
      'Tải lên một file ảnh định dạng PNG, JPEG hoặc WebP. Giới hạn dung lượng tối đa 5MB. Trả về đường dẫn URL công khai để sử dụng cho sản phẩm.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Tập tin hình ảnh cần tải lên',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh (PNG, JPEG, WebP, tối đa 5MB)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tải lên ảnh thành công, trả về URL hình ảnh',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Thiếu file ảnh, sai định dạng hoặc nội dung file không hợp lệ',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Yêu cầu quyền quản trị viên (Admin)',
    type: ErrorResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) =>
          cb(
            null,
            `${randomUUID()}.${
              file.mimetype === 'image/png'
                ? 'png'
                : file.mimetype === 'image/webp'
                  ? 'webp'
                  : 'jpg'
            }`,
          ),
      }),
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
      fileFilter: (_req, file, cb) => {
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
          return cb(
            new BadRequestException('Chỉ chấp nhận PNG, JPEG, WebP'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Thiếu ảnh');
    }
    const bytes = await readFile(file.path);
    const valid =
      file.mimetype === 'image/png'
        ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : file.mimetype === 'image/jpeg'
          ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          : bytes.toString('ascii', 0, 4) === 'RIFF' &&
            bytes.toString('ascii', 8, 12) === 'WEBP';
    if (!valid) {
      await unlink(file.path);
      throw new BadRequestException('Nội dung file không phải ảnh hợp lệ');
    }
    return {
      image: `${process.env.PUBLIC_URL || 'http://localhost:5000'}/uploads/${file.filename}`,
    };
  }
}

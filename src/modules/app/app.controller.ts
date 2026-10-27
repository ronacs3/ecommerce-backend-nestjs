import { BadRequestException, Body, Controller, Get, Post, ServiceUnavailableException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { readFile, unlink } from 'fs/promises';
import { Public, Admin } from '../../common/decorators';
import { MessageDto } from './dto/message.dto';

@Controller()
export class AppController {
  constructor(private readonly db: DataSource) {}

  @Public()
  @Get('health')
  async health() {
    await this.db.query('SELECT 1');
    return { status: 'ok', database: 'postgresql' };
  }

  @Post('chat')
  chat(@Body() _b: MessageDto) {
    throw new ServiceUnavailableException('Chưa cấu hình nhà cung cấp AI cho chatbot');
  }

  @Admin()
  @Post('upload')
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

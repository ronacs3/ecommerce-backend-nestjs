import 'reflect-metadata';
import 'dotenv/config';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DatabaseErrorFilter } from './common/filters/database-error.filter';

async function bootstrap() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.startsWith('replace-')
  ) {
    throw new Error('Set JWT_SECRET to a random secret of at least 32 characters');
  }

  mkdirSync(join(process.cwd(), 'uploads'), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:3000')
      .split(',')
      .map((s) => s.trim()),
  });
  app.setGlobalPrefix('api');

  // Strip snapshots and displayed totals supplied by the frontend; calculate them from database prices.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new DatabaseErrorFilter());
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // Swagger OpenAPI Documentation Configuration
  const config = new DocumentBuilder()
    .setTitle('E-Commerce REST API')
    .setDescription(
      `### Giới thiệu hệ thống E-Commerce API
Tài liệu API chính thức và chi tiết dành cho hệ thống thương mại điện tử **E-Commerce Backend (NestJS + PostgreSQL)**.

---
### 🔐 Cơ chế xác thực & Phân quyền (Authentication & Authorization)
Hệ thống sử dụng cơ chế xác thực dựa trên **JSON Web Token (JWT Bearer Token)**:
* **Public**: Các API công khai không yêu cầu đăng nhập (xem danh sách sản phẩm, danh mục, kiểm tra mã giảm giá, đăng ký, đăng nhập).
* **Customer (Đã đăng nhập)**: Yêu cầu gửi kèm header \`Authorization: Bearer <token>\`. Sử dụng cho việc cập nhật hồ sơ, tạo đơn hàng, xem lịch sử đơn hàng cá nhân và gửi đánh giá sản phẩm đã mua.
* **Admin (Quản trị viên)**: Yêu cầu tài khoản có cờ \`isAdmin = true\`. Được cấp quyền quản lý tài khoản người dùng, sản phẩm (thêm/sửa/xóa), danh mục, mã giảm giá, xác nhận thanh toán/giao hàng và xem báo cáo thống kê doanh số.

---
### 🛒 Quy tắc nghiệp vụ cốt lõi (Business Rules)
* **Tính toán giá trị đơn hàng an toàn**: Giá và tổng tiền gửi từ Client/Frontend sẽ bị loại bỏ và tính toán lại 100% dựa trên đơn giá trong cơ sở dữ liệu để chống gian lận.
* **Chính sách Thuế & Phí vận chuyển**:
  * Thuế VAT: **10%** trên tổng giá trị hàng hóa.
  * Phí giao hàng tiêu chuẩn: **30.000 VNĐ**.
  * Miễn phí giao hàng (**0 VNĐ**) khi tổng tiền hàng vượt quá **10.000.000 VNĐ**.
* **Mã giảm giá (Coupon)**: Hỗ trợ giảm theo % tiền hàng. Coupon có thể áp dụng toàn sàn hoặc chỉ áp dụng cho danh mục sản phẩm cụ thể.
* **Kiểm soát tồn kho & Chống xung đột (Concurrency Control)**:
  * Khi tạo đơn hàng, hệ thống sử dụng **Pessimistic Write Lock** để khóa hàng và trừ tồn kho ngay lập tức.
  * Khi đơn hàng bị hủy (chưa thanh toán / chưa giao), số lượng tồn kho được hoàn trả tự động trong database transaction.
* **Quy trình chuyển đổi trạng thái đơn hàng**:
  * Khách đặt đơn: \`isPaid = false\`, \`isDelivered = false\`, \`isCancelled = false\`.
  * Hủy đơn: Chỉ hủy được khi đơn hàng **chưa thanh toán** và **chưa giao hàng**.
  * Giao hàng: Chỉ có thể xác nhận giao hàng khi đơn hàng **đã thanh toán**.
* **Đánh giá sản phẩm**: Khách hàng chỉ có thể gửi nhận xét / đánh giá khi đã đặt mua sản phẩm đó trong một đơn hàng đã thanh toán, và mỗi người dùng chỉ được đánh giá 1 lần duy nhất cho mỗi sản phẩm.
      `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập JWT token theo định dạng: Bearer <token>',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag(
      'Auth & Users',
      'Quản lý xác thực tài khoản, đăng ký, đăng nhập, thông tin hồ sơ và quản lý người dùng',
    )
    .addTag(
      'Products',
      'Quản lý danh mục sản phẩm, tìm kiếm từ khóa, lọc theo khoảng giá, đánh giá sao và so sánh AI',
    )
    .addTag('Categories', 'Quản lý phân loại nhóm hàng hóa (CRUD)')
    .addTag(
      'Coupons',
      'Quản lý mã khuyến mãi, thiết lập tỷ lệ giảm giá, thời hạn và kiểm tra tính hợp lệ với giỏ hàng',
    )
    .addTag(
      'Orders',
      'Xử lý giỏ hàng, đặt đơn, chuyển đổi trạng thái thanh toán/giao hàng và báo cáo doanh thu thống kê',
    )
    .addTag(
      'System & Uploads',
      'Kiểm tra trạng thái máy chủ (Health Check) và tải lên hình ảnh sản phẩm',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'list',
    },
    customSiteTitle: 'E-Commerce API Documentation',
  });

  const port = Number(process.env.PORT || 5000);
  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});

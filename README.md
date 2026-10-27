# E-Commerce Backend — NestJS + PostgreSQL

Project backend độc lập cho `frontend-e-commerce`, dùng NestJS 11, TypeScript, TypeORM, PostgreSQL và JWT. Có `package.json`, lockfile, cấu hình môi trường, migration, seed và test riêng. Không phụ thuộc mã nguồn hoặc thư viện của frontend.

## Khởi chạy

Yêu cầu Node.js 20+ và PostgreSQL 16 (cài trực tiếp hoặc Docker).

```powershell
cd C:\Users\ADMIN\OneDrive\Desktop\ecommerce-backend-nestjs
npm.cmd ci
Copy-Item .env.example .env
```

Sửa `.env`: cấu hình `DATABASE_URL`, đặt `JWT_SECRET` ngẫu nhiên ít nhất 32 ký tự, `ADMIN_EMAIL`, `ADMIN_PASSWORD` ít nhất 12 ký tự. Thay mọi giá trị bắt đầu bằng `replace-`.

Nếu dùng Docker, chạy `docker compose up -d`. Nếu PostgreSQL đã chạy trên máy, tạo database `ecommerce` và chỉnh `DATABASE_URL`. Không khởi động thêm container trên cổng 5432 đang được sử dụng. Tài khoản migration cần quyền tạo bảng và extension `uuid-ossp`.

```powershell
npm.cmd run prisma:push      # Đồng bộ schema và tạo bảng qua Prisma
npm.cmd run seed             # Khởi tạo dữ liệu mẫu
npm.cmd run start:dev        # Khởi chạy server development
```

Ngoài ra với Prisma có thể dùng:
- `npm.cmd run prisma:studio` : Mở giao diện trực quan Prisma Studio quản lý dữ liệu
- `npm.cmd run prisma:generate` : Tự động tạo Prisma Client mới nhất
- `npm.cmd run prisma:migrate` : Tạo migration có phiên bản


Seed tạo admin và sản phẩm mẫu; không thay mật khẩu admin đã tồn tại. Schema dùng migration, không dùng `synchronize`.

- API: `http://localhost:5000/api`
- Swagger: `http://localhost:5000/api/docs`
- Health check có truy vấn database: `http://localhost:5000/api/health`
- Test: `npm.cmd test`
- Build và chạy: `npm.cmd run build`, `npm.cmd start`

## Kết nối frontend chạy riêng

Tại `frontend-e-commerce/.env.local`, đặt:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Chạy frontend bằng terminal riêng với `npm.cmd run dev`. `FRONTEND_URL` trong backend phải khớp origin frontend; có thể cấu hình nhiều origin phân cách bằng dấu phẩy.

Upload ảnh yêu cầu frontend gửi `Authorization: Bearer <token>`, cùng `FormData` chứa field `image`. Với chatbot và so sánh sản phẩm, frontend nên dùng `NEXT_PUBLIC_API_URL` thay cho URL hardcode. Các request khác giữ nguyên endpoint và trường `_id` (UUID).

## Cấu trúc

```text
src/
  main.ts                # Bootstrap, CORS, validation, Swagger, xử lý lỗi
  app.module.ts          # Khai báo dependency và global guards
  auth.ts                # JWT guard và phân quyền admin
  controllers.ts         # API tài khoản, sản phẩm, danh mục, coupon, đơn hàng
  dto.ts                 # Kiểm tra dữ liệu đầu vào
  entities.ts            # Model PostgreSQL
  shop.service.ts        # Logic nghiệp vụ, transaction và tồn kho
  pricing.ts             # Quy tắc tính tiền
  database.ts            # TypeORM DataSource
  migrations/initial.ts  # Tạo schema
  seed.ts                # Tạo admin và dữ liệu mẫu
test/backend.test.js
compose.yaml
.env.example
```

## API

Mọi đường dẫn bên dưới đều có tiền tố `/api`.

| Nhóm | Endpoint | Quyền |
| --- | --- | --- |
| Tài khoản | `POST /users`, `POST /users/login` | Công khai |
| Hồ sơ | `GET/PUT /users/profile` | Đăng nhập |
| Người dùng | `GET /users`, `DELETE /users/:id` | Admin |
| Sản phẩm | `GET /products`, `GET /products/:id`, `GET /products/:id/related`, `GET /products/categories` | Công khai |
| Sản phẩm | `POST /products`, `PUT/DELETE /products/:id` | Admin |
| Đánh giá | `POST /products/:id/reviews` | Đã mua và thanh toán; một đánh giá mỗi sản phẩm |
| Danh mục | `GET /categories`, `GET /categories/:id` | Công khai |
| Danh mục | `POST /categories`, `PUT/DELETE /categories/:id` | Admin |
| Coupon | `POST /coupons/validate` | Công khai |
| Coupon | `GET/POST /coupons`, `DELETE /coupons/:id` | Admin |
| Đơn hàng | `POST /orders`, `GET /orders/myorders` | Đăng nhập |
| Chi tiết/hủy | `GET /orders/:id`, `PUT /orders/:id/cancel` | Chủ đơn hoặc admin |
| Quản trị đơn | `GET /orders`, `GET /orders/stats`, `PUT /orders/:id/pay`, `PUT /orders/:id/deliver` | Admin |
| Upload | `POST /upload`, tối đa 5 MB, JPEG/PNG/WebP | Admin |

Lọc sản phẩm bằng `keyword`, `category` (tên danh mục), `minPrice`, `maxPrice`. Các API danh sách trả mảng để khớp frontend.

Đăng nhập gửi `{ "email": "...", "password": "..." }`, nhận `{ _id, name, email, isAdmin, token }`. Với route yêu cầu đăng nhập, gửi `Authorization: Bearer <token>`.

Backend bỏ qua giá và tổng tiền client gửi lên, lấy giá từ database: VAT 10%, ship 30.000đ, miễn ship khi tiền hàng trên 10 triệu. Coupon chỉ giảm tiền hàng thuộc danh mục áp dụng; danh mục rỗng áp dụng toàn bộ. Tồn kho được trừ khi tạo đơn, hoàn lại khi hủy bằng transaction và khóa hàng. Chỉ hủy đơn chưa thanh toán/chưa giao; chỉ đánh dấu giao sau khi thanh toán. Admin xác nhận thanh toán thủ công.

## Phạm vi hiện tại

- PayPal/thẻ chỉ lưu lựa chọn phương thức, chưa tích hợp cổng thanh toán hoặc webhook.
- Chatbot, so sánh AI và quên mật khẩu trả HTTP 503 vì chưa cấu hình nhà cung cấp AI/email và luồng đặt lại mật khẩu.
- Ảnh lưu tại `uploads/`; khi triển khai cần volume bền vững hoặc object storage. `PUBLIC_URL` là địa chỉ backend công khai.
- Không thể xóa người dùng có đơn hàng hoặc danh mục còn sản phẩm do ràng buộc foreign key.

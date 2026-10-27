import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseErrorFilter implements ExceptionFilter {
  catch(error: QueryFailedError & { driverError: { code?: string } }, host: ArgumentsHost) {
    const code = error.driverError?.code;
    const status =
      code === '23505' || code === '23503'
        ? 409
        : code === '22P02' || code === '23514'
          ? 400
          : 500;

    const message =
      code === '23505'
        ? 'Dữ liệu đã tồn tại'
        : code === '23503'
          ? 'Dữ liệu đang được sử dụng hoặc tham chiếu không hợp lệ'
          : status === 400
            ? 'Dữ liệu không hợp lệ'
            : 'Lỗi cơ sở dữ liệu';

    host.switchToHttp().getResponse().status(status).json({
      statusCode: status,
      message,
    });
  }
}

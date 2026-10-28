import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public, Admin } from '../../common/decorators';
import { MessageResponseDto, ErrorResponseDto } from '../../common/dto';
import { UsersService } from './users.service';
import {
  LoginDto,
  RegisterDto,
  ProfileDto,
  EmailDto,
  AuthResponseDto,
  UserResponseDto,
} from './dto';

@ApiTags('Auth & Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Đăng ký tài khoản người dùng mới',
    description:
      'Tạo tài khoản khách hàng mới với email duy nhất và mật khẩu tối thiểu 8 ký tự. Tự động mã hóa mật khẩu bằng bcrypt và trả về thông tin phiên làm việc kèm JWT token.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      default: {
        summary: 'Mẫu đăng ký tài khoản khách hàng',
        value: {
          name: 'Nguyễn Văn A',
          email: 'customer@example.com',
          password: 'Password123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công, trả về thông tin người dùng và JWT Bearer Token',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ hoặc email đã tồn tại trên hệ thống',
    type: ErrorResponseDto,
  })
  async register(@Body() b: RegisterDto) {
    return this.usersService.register(b);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập vào hệ thống',
    description:
      'Xác thực tài khoản bằng email và mật khẩu. Giới hạn 10 lượt request mỗi phút để phòng chống tấn công brute-force. Trả về JWT token có thời hạn 7 ngày.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      customer: {
        summary: 'Đăng nhập khách hàng',
        value: {
          email: 'customer@example.com',
          password: 'Password123!',
        },
      },
      admin: {
        summary: 'Đăng nhập Quản trị viên (Admin)',
        value: {
          email: 'admin@example.com',
          password: 'AdminPassword123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về JWT Bearer Token và quyền hạn',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email hoặc mật khẩu không chính xác',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Đã vượt quá giới hạn số lần yêu cầu đăng nhập trong 1 phút',
    type: ErrorResponseDto,
  })
  async login(@Body() b: LoginDto) {
    return this.usersService.login(b);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Yêu cầu khôi phục mật khẩu qua email',
    description:
      'Gửi liên kết khôi phục mật khẩu đến email người dùng (hiện tại dịch vụ email đang chuẩn bị cấu hình).',
  })
  @ApiBody({
    type: EmailDto,
    examples: {
      default: {
        summary: 'Email yêu cầu khôi phục mật khẩu',
        value: {
          email: 'customer@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Chưa cấu hình dịch vụ email khôi phục mật khẩu',
    type: ErrorResponseDto,
  })
  forgot(@Body() _b: EmailDto) {
    throw new ServiceUnavailableException(
      'Chưa cấu hình dịch vụ email khôi phục mật khẩu. Vui lòng liên hệ quản trị viên.',
    );
  }

  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @ApiOperation({
    summary: 'Lấy thông tin hồ sơ của người dùng đang đăng nhập',
    description:
      'Yêu cầu Bearer JWT token hợp lệ trong header Authorization. Trả về thông tin chi tiết tài khoản hiện tại.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin tài khoản thành công',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token đã hết hạn / không hợp lệ',
    type: ErrorResponseDto,
  })
  profile(@Req() req: any) {
    return req.user;
  }

  @ApiBearerAuth('JWT-auth')
  @Put('profile')
  @ApiOperation({
    summary: 'Cập nhật thông tin hồ sơ cá nhân',
    description:
      'Cho phép người dùng đang đăng nhập thay đổi họ tên, email hoặc mật khẩu mới. Nếu cập nhật thành công sẽ cấp lại JWT token mới.',
  })
  @ApiBody({
    type: ProfileDto,
    examples: {
      updateNameEmail: {
        summary: 'Cập nhật họ tên & email',
        value: {
          name: 'Nguyễn Văn B',
          email: 'newemail@example.com',
        },
      },
      changePassword: {
        summary: 'Đổi mật khẩu mới',
        value: {
          password: 'NewPassword123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật hồ sơ thành công, trả về phiên đăng nhập mới',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Email mới đã tồn tại trên tài khoản khác hoặc mật khẩu không hợp lệ',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token không hợp lệ',
    type: ErrorResponseDto,
  })
  async update(@Req() req: any, @Body() b: ProfileDto) {
    return this.usersService.updateProfile(req.user, b);
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả tài khoản người dùng (Chỉ dành cho Admin)',
    description:
      'Quản trị viên xem toàn bộ danh sách khách hàng và quản trị viên trong hệ thống, sắp xếp theo thời gian đăng ký mới nhất.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách người dùng hệ thống',
    type: [UserResponseDto],
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
  list() {
    return this.usersService.findAll();
  }

  @Admin()
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa tài khoản người dùng theo ID (Chỉ dành cho Admin)',
    description:
      'Quản trị viên xóa vĩnh viễn tài khoản người dùng theo UUID. Quản trị viên không thể tự xóa tài khoản của chính mình.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của người dùng cần xóa',
    format: 'uuid',
    example: 'd3b07384-d113-4001-9a7f-7a4c7e6c4013',
  })
  @ApiResponse({
    status: 200,
    description: 'Đã xóa người dùng thành công',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Không thể tự xóa chính mình',
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
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy người dùng với ID đã chỉ định',
    type: ErrorResponseDto,
  })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.usersService.remove(id, req.user._id);
  }
}

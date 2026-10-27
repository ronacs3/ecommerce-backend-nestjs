import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, ServiceUnavailableException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public, Admin } from '../../common/decorators';
import { UsersService } from './users.service';
import { LoginDto, RegisterDto, ProfileDto, EmailDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async register(@Body() b: RegisterDto) {
    return this.usersService.register(b);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(@Body() b: LoginDto) {
    return this.usersService.login(b);
  }

  @Public()
  @Post('forgot-password')
  forgot(@Body() _b: EmailDto) {
    throw new ServiceUnavailableException('Chưa cấu hình dịch vụ email khôi phục mật khẩu. Vui lòng liên hệ quản trị viên.');
  }

  @Get('profile')
  profile(@Req() req: any) {
    return req.user;
  }

  @Put('profile')
  async update(@Req() req: any, @Body() b: ProfileDto) {
    return this.usersService.updateProfile(req.user, b);
  }

  @Admin()
  @Get()
  list() {
    return this.usersService.findAll();
  }

  @Admin()
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.usersService.remove(id, req.user._id);
  }
}

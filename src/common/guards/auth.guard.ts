import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwt: JwtService,
    private db: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride('public', [ctx.getHandler(), ctx.getClass()])) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    try {
      const [scheme, token] = (req.headers.authorization || '').split(' ');
      if (scheme !== 'Bearer' || !token) {
        throw new Error();
      }
      const payload = await this.jwt.verifyAsync(token);
      req.user = await this.db.getRepository(User).findOneBy({ _id: payload.sub });
      if (!req.user) {
        throw new Error();
      }
    } catch {
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }

    if (this.reflector.getAllAndOverride('admin', [ctx.getHandler(), ctx.getClass()]) && !req.user.isAdmin) {
      throw new ForbiddenException('Yêu cầu quyền quản trị');
    }

    return true;
  }
}

import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import { User } from './entities/user.entity';
import { LoginDto, RegisterDto, ProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: DataSource,
    private readonly jwt: JwtService,
  ) {}

  async session(u: User) {
    return {
      _id: u._id,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      token: await this.jwt.signAsync({ sub: u._id }),
    };
  }

  async register(b: RegisterDto) {
    const r = this.db.getRepository(User);
    const u = r.create({
      name: b.name,
      email: b.email.trim().toLowerCase(),
      password: await hash(b.password, 12),
      isAdmin: false,
    });
    return this.session(await r.save(u));
  }

  async login(b: LoginDto) {
    const u = await this.db
      .getRepository(User)
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email: b.email.trim().toLowerCase() })
      .getOne();
    if (!u || !(await compare(b.password, u.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return this.session(u);
  }

  async updateProfile(user: User, b: ProfileDto) {
    if (b.name) user.name = b.name;
    if (b.email) user.email = b.email.trim().toLowerCase();
    if (b.password) user.password = await hash(b.password, 12);
    return this.session(await this.db.getRepository(User).save(user));
  }

  async findAll() {
    return this.db.getRepository(User).find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string) {
    return this.db.getRepository(User).findOneBy({ _id: id });
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('Không thể xóa chính mình');
    }
    const result = await this.db.getRepository(User).delete(id);
    if (!result.affected) {
      throw new NotFoundException();
    }
    return { message: 'Đã xóa người dùng' };
  }
}

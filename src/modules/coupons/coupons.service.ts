import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CouponCheckDto, CouponDto } from './dto';

@Injectable()
export class CouponsService {
  constructor(private readonly db: DataSource) {}

  async findByCode(code: string, manager: EntityManager = this.db.manager): Promise<Coupon> {
    const c = await manager.findOneBy(Coupon, { code: code.trim().toUpperCase() });
    if (!c || c.expirationDate.getTime() <= Date.now()) {
      throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }
    return c;
  }

  async validateCoupon(b: CouponCheckDto): Promise<Coupon> {
    const c = await this.findByCode(b.code);
    const ids = b.cartItems.map((i) => i?.product || i?._id || '');
    if (ids.some((id) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
      throw new BadRequestException('Mã sản phẩm không hợp lệ');
    }
    const products = await this.db.getRepository(Product).findBy({ _id: In(ids) });
    if (
      !products.length ||
      (c.applicableCategories.length && !products.some((p) => c.applicableCategories.includes(p.category)))
    ) {
      throw new BadRequestException('Mã không áp dụng cho giỏ hàng');
    }
    return c;
  }

  async findAll(): Promise<Coupon[]> {
    return this.db.getRepository(Coupon).find({ order: { createdAt: 'DESC' } });
  }

  async create(b: CouponDto): Promise<Coupon> {
    const expirationDate = new Date(
      b.expirationDate.length === 10
        ? `${b.expirationDate}T23:59:59.999+07:00`
        : b.expirationDate,
    );
    if (expirationDate.getTime() <= Date.now()) {
      throw new BadRequestException('Ngày hết hạn phải ở tương lai');
    }
    for (const name of b.applicableCategories || []) {
      const exists = await this.db.getRepository(Category).existsBy({ name });
      if (!exists) {
        throw new BadRequestException('Danh mục không tồn tại');
      }
    }
    const r = this.db.getRepository(Coupon);
    return r.save(r.create({ ...b, code: b.code.trim().toUpperCase(), expirationDate }));
  }

  async remove(id: string): Promise<{ message: string }> {
    const r = await this.db.getRepository(Coupon).delete(id);
    if (!r.affected) {
      throw new NotFoundException();
    }
    return { message: 'Đã xóa mã' };
  }
}

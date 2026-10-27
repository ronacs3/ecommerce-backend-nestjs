import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Coupon, Order, Product, Review, User, OrderItem } from './database/entities';
import { OrderDto } from './modules/orders/dto';
import { totals } from './common/utils/pricing.util';

@Injectable()
export class ShopService {
  constructor(readonly db: DataSource) {}

  async product(p: Product) {
    const reviews = await this.db.getRepository(Review).find({ where: { productId: p._id }, order: { createdAt: 'DESC' } });
    return {
      ...p, reviews: reviews.map(r => ({ ...r, user: r.userId })), numReviews: reviews.length,
      rating: reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
    };
  }

  async products(q: Record<string, string> = {}) {
    const qb = this.db.getRepository(Product).createQueryBuilder('p');
    if (q.keyword) qb.andWhere('(p.name ILIKE :keyword OR p.description ILIKE :keyword)', { keyword: `%${q.keyword.slice(0, 200)}%` });
    if (q.category) qb.andWhere('p.category = :category', { category: q.category });
    for (const [key, op] of [['minPrice', '>='], ['maxPrice', '<=']]) {
      if (!q[key]) continue;
      if (!Number.isFinite(Number(q[key])) || Number(q[key]) < 0) throw new BadRequestException('Khoảng giá không hợp lệ');
      qb.andWhere(`p.price ${op} :${key}`, { [key]: Number(q[key]) });
    }
    return Promise.all((await qb.orderBy('p.createdAt', 'DESC').getMany()).map(p => this.product(p)));
  }

  async oneProduct(id: string) {
    const p = await this.db.getRepository(Product).findOneBy({ _id: id });
    if (!p) throw new NotFoundException('Không tìm thấy sản phẩm');
    return this.product(p);
  }

  async coupon(code: string, manager: EntityManager = this.db.manager) {
    const c = await manager.findOneBy(Coupon, { code: code.trim().toUpperCase() });
    if (!c || c.expirationDate.getTime() <= Date.now()) throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    return c;
  }

  async createOrder(user: User, dto: OrderDto) {
    if (!dto.shippingAddress) throw new BadRequestException('Thiếu địa chỉ giao hàng');
    return this.db.transaction(async m => {
      const quantities = new Map<string, number>();
      for (const i of dto.orderItems) quantities.set(i.product, (quantities.get(i.product) || 0) + i.qty);
      const items: OrderItem[] = [];
      for (const id of [...quantities.keys()].sort()) {
        const p = await m.findOne(Product, { where: { _id: id }, lock: { mode: 'pessimistic_write' } });
        const qty = quantities.get(id)!;
        if (!p || p.countInStock < qty) throw new BadRequestException('Sản phẩm không tồn tại hoặc không đủ tồn kho');
        items.push({ product: id, qty, name: p.name, image: p.image, category: p.category, price: p.price });
        p.countInStock -= qty;
        await m.save(p);
      }
      const coupon = dto.couponCode ? await this.coupon(dto.couponCode, m) : null;
      if (coupon?.applicableCategories.length && !items.some(i => coupon.applicableCategories.includes(i.category))) {
        throw new BadRequestException('Mã giảm giá không áp dụng cho giỏ hàng');
      }
      return m.save(Order, m.create(Order, {
        userId: user._id, orderItems: items, shippingAddress: { ...dto.shippingAddress }, paymentMethod: dto.paymentMethod,
        couponCode: coupon?.code, ...totals(items, coupon?.discount, coupon?.applicableCategories),
      }));
    });
  }

  async order(id: string, user: User) {
    const order = await this.db.getRepository(Order).findOneBy({ _id: id });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.userId !== user._id && !user.isAdmin) throw new ForbiddenException();
    return { ...order, user: await this.db.getRepository(User).findOneBy({ _id: order.userId }) };
  }

  async transition(id: string, user: User, action: 'cancel' | 'pay' | 'deliver') {
    return this.db.transaction(async m => {
      const o = await m.findOne(Order, { where: { _id: id }, lock: { mode: 'pessimistic_write' } });
      if (!o) throw new NotFoundException();
      if (o.userId !== user._id && !user.isAdmin) throw new ForbiddenException();
      if (o.isCancelled) throw new BadRequestException('Đơn hàng đã bị hủy');
      if (action === 'cancel') {
        if (o.isPaid || o.isDelivered) throw new BadRequestException('Không thể hủy đơn đã thanh toán hoặc giao hàng');
        o.isCancelled = true;
        for (const i of [...o.orderItems].sort((a, b) => a.product.localeCompare(b.product))) {
          await m.increment(Product, { _id: i.product }, 'countInStock', i.qty);
        }
      } else {
        if (!user.isAdmin) throw new ForbiddenException();
        if (action === 'pay') {
          if (o.isPaid) throw new BadRequestException('Đơn đã thanh toán');
          o.isPaid = true; o.paidAt = new Date();
        } else {
          if (!o.isPaid || o.isDelivered) throw new BadRequestException('Đơn phải được thanh toán và chưa giao');
          o.isDelivered = true; o.deliveredAt = new Date();
        }
      }
      return m.save(o);
    });
  }

  async stats() {
    const orders = await this.db.getRepository(Order).find({ where: { isCancelled: false }, order: { createdAt: 'ASC' } });
    const days = new Map<string, { _id: string; count: number; totalSales: number }>();
    const products = new Map<string, { _id: string; name: string; totalQty: number }>();
    for (const o of orders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      const row = days.get(day) || { _id: day, count: 0, totalSales: 0 };
      row.count++;
      if (o.isPaid) row.totalSales += o.totalPrice;
      days.set(day, row);
      if (o.isPaid) for (const i of o.orderItems) {
        const p = products.get(i.product) || { _id: i.product, name: i.name, totalQty: 0 };
        p.totalQty += i.qty; products.set(i.product, p);
      }
    }
    return {
      dailyOrders: [...days.values()],
      statusStats: [true, false].map(p => ({ _id: p, count: orders.filter(o => o.isPaid === p).length })),
      topProducts: [...products.values()].sort((a, b) => b.totalQty - a.totalQty).slice(0, 10),
    };
  }
}

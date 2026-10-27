import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './interfaces/order-item.interface';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { OrderDto } from './dto';
import { totals } from '../../common/utils/pricing.util';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly db: DataSource,
    private readonly couponsService: CouponsService,
  ) {}

  async createOrder(user: User, dto: OrderDto) {
    if (!dto.shippingAddress) {
      throw new BadRequestException('Thiếu địa chỉ giao hàng');
    }

    return this.db.transaction(async (m) => {
      const quantities = new Map<string, number>();
      for (const i of dto.orderItems) {
        quantities.set(i.product, (quantities.get(i.product) || 0) + i.qty);
      }

      const items: OrderItem[] = [];
      // Use a consistent lock order for carts containing overlapping products.
      for (const id of [...quantities.keys()].sort()) {
        const p = await m.findOne(Product, {
          where: { _id: id },
          lock: { mode: 'pessimistic_write' },
        });
        const qty = quantities.get(id)!;
        if (!p || p.countInStock < qty) {
          throw new BadRequestException('Sản phẩm không tồn tại hoặc không đủ tồn kho');
        }
        items.push({
          product: id,
          qty,
          name: p.name,
          image: p.image,
          category: p.category,
          price: p.price,
        });
        p.countInStock -= qty;
        await m.save(p);
      }

      const coupon = dto.couponCode
        ? await this.couponsService.findByCode(dto.couponCode, m)
        : null;

      if (
        coupon?.applicableCategories.length &&
        !items.some((i) => coupon.applicableCategories.includes(i.category))
      ) {
        throw new BadRequestException('Mã giảm giá không áp dụng cho giỏ hàng');
      }

      return m.save(
        Order,
        m.create(Order, {
          userId: user._id,
          orderItems: items,
          shippingAddress: { ...dto.shippingAddress },
          paymentMethod: dto.paymentMethod,
          couponCode: coupon?.code,
          ...totals(items, coupon?.discount, coupon?.applicableCategories),
        }),
      );
    });
  }

  async findUserOrders(userId: string) {
    return this.db.getRepository(Order).find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const order = await this.db.getRepository(Order).findOneBy({ _id: id });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    if (order.userId !== user._id && !user.isAdmin) {
      throw new ForbiddenException();
    }
    return {
      ...order,
      user: await this.db.getRepository(User).findOneBy({ _id: order.userId }),
    };
  }

  async findAll(currentUser: User) {
    const orders = await this.db
      .getRepository(Order)
      .find({ order: { createdAt: 'DESC' } });
    return Promise.all(orders.map((o) => this.findOne(o._id, currentUser)));
  }

  async transition(id: string, user: User, action: 'cancel' | 'pay' | 'deliver') {
    return this.db.transaction(async (m) => {
      const o = await m.findOne(Order, {
        where: { _id: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!o) {
        throw new NotFoundException();
      }
      if (o.userId !== user._id && !user.isAdmin) {
        throw new ForbiddenException();
      }
      if (o.isCancelled) {
        throw new BadRequestException('Đơn hàng đã bị hủy');
      }

      if (action === 'cancel') {
        if (o.isPaid || o.isDelivered) {
          throw new BadRequestException('Không thể hủy đơn đã thanh toán hoặc giao hàng');
        }
        o.isCancelled = true;
        for (const i of [...o.orderItems].sort((a, b) =>
          a.product.localeCompare(b.product),
        )) {
          await m.increment(Product, { _id: i.product }, 'countInStock', i.qty);
        }
      } else {
        if (!user.isAdmin) {
          throw new ForbiddenException();
        }
        if (action === 'pay') {
          if (o.isPaid) {
            throw new BadRequestException('Đơn đã thanh toán');
          }
          o.isPaid = true;
          o.paidAt = new Date();
        } else {
          if (!o.isPaid || o.isDelivered) {
            throw new BadRequestException('Đơn phải được thanh toán và chưa giao');
          }
          o.isDelivered = true;
          o.deliveredAt = new Date();
        }
      }
      return m.save(o);
    });
  }

  async getStats() {
    const orders = await this.db
      .getRepository(Order)
      .find({ where: { isCancelled: false }, order: { createdAt: 'ASC' } });
    const days = new Map<string, { _id: string; count: number; totalSales: number }>();
    const products = new Map<string, { _id: string; name: string; totalQty: number }>();

    for (const o of orders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      const row = days.get(day) || { _id: day, count: 0, totalSales: 0 };
      row.count++;
      if (o.isPaid) {
        row.totalSales += o.totalPrice;
      }
      days.set(day, row);

      if (o.isPaid) {
        for (const i of o.orderItems) {
          const p = products.get(i.product) || {
            _id: i.product,
            name: i.name,
            totalQty: 0,
          };
          p.totalQty += i.qty;
          products.set(i.product, p);
        }
      }
    }

    return {
      dailyOrders: [...days.values()],
      statusStats: [true, false].map((p) => ({
        _id: p,
        count: orders.filter((o) => o.isPaid === p).length,
      })),
      topProducts: [...products.values()]
        .sort((a, b) => b.totalQty - a.totalQty)
        .slice(0, 10),
    };
  }
}

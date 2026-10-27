import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { Review } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity';
import { Category } from '../categories/entities/category.entity';
import { ProductDto, ReviewDto } from './dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DataSource) {}

  async formatProduct(p: Product) {
    const reviews = await this.db.getRepository(Review).find({
      where: { productId: p._id },
      order: { createdAt: 'DESC' },
    });
    return {
      ...p,
      reviews: reviews.map((r) => ({ ...r, user: r.userId })),
      numReviews: reviews.length,
      rating: reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0,
    };
  }

  async findAll(q: Record<string, string> = {}) {
    const qb = this.db.getRepository(Product).createQueryBuilder('p');
    if (q.keyword) {
      qb.andWhere('(p.name ILIKE :keyword OR p.description ILIKE :keyword)', {
        keyword: `%${q.keyword.slice(0, 200)}%`,
      });
    }
    if (q.category) {
      qb.andWhere('p.category = :category', { category: q.category });
    }
    for (const [key, op] of [
      ['minPrice', '>='],
      ['maxPrice', '<='],
    ]) {
      if (!q[key]) continue;
      if (!Number.isFinite(Number(q[key])) || Number(q[key]) < 0) {
        throw new BadRequestException('Khoảng giá không hợp lệ');
      }
      qb.andWhere(`p.price ${op} :${key}`, { [key]: Number(q[key]) });
    }
    return Promise.all(
      (await qb.orderBy('p.createdAt', 'DESC').getMany()).map((p) =>
        this.formatProduct(p),
      ),
    );
  }

  async findOne(id: string) {
    const p = await this.db.getRepository(Product).findOneBy({ _id: id });
    if (!p) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return this.formatProduct(p);
  }

  async getCategoryNames(): Promise<string[]> {
    const categories = await this.db.getRepository(Category).find();
    return categories.map((c) => c.name);
  }

  async getRelated(id: string) {
    const p = await this.findOne(id);
    const relatedProducts = await this.findAll({ category: p.category });
    return relatedProducts.filter((x) => x._id !== id).slice(0, 4);
  }

  async create(b: ProductDto) {
    await this.ensureCategoryExists(b.category);
    const r = this.db.getRepository(Product);
    const saved = await r.save(r.create(b));
    return this.formatProduct(saved);
  }

  async update(id: string, b: ProductDto) {
    await this.findOne(id);
    await this.ensureCategoryExists(b.category);
    await this.db.getRepository(Product).update(id, b);
    return this.findOne(id);
  }

  async ensureCategoryExists(name: string) {
    const exists = await this.db.getRepository(Category).existsBy({ name });
    if (!exists) {
      throw new BadRequestException('Danh mục không tồn tại');
    }
  }

  async remove(id: string) {
    const pending = await this.db
      .getRepository(Order)
      .createQueryBuilder('o')
      .where('o."isCancelled" = false AND o."isPaid" = false')
      .andWhere('o."orderItems" @> :items::jsonb', {
        items: JSON.stringify([{ product: id }]),
      })
      .getCount();
    if (pending) {
      throw new BadRequestException('Sản phẩm đang thuộc đơn hàng chờ xử lý');
    }
    const r = await this.db.getRepository(Product).delete(id);
    if (!r.affected) {
      throw new NotFoundException();
    }
    return { message: 'Đã xóa sản phẩm' };
  }

  async addReview(id: string, user: User, b: ReviewDto) {
    await this.findOne(id);
    const bought = await this.db
      .getRepository(Order)
      .createQueryBuilder('o')
      .where(
        'o."userId" = :user AND o."isPaid" = true AND o."isCancelled" = false',
        { user: user._id },
      )
      .andWhere('o."orderItems" @> :items::jsonb', {
        items: JSON.stringify([{ product: id }]),
      })
      .getCount();
    if (!bought) {
      throw new BadRequestException(
        'Chỉ được đánh giá sản phẩm đã mua và thanh toán',
      );
    }
    const r = this.db.getRepository(Review);
    return r.save(
      r.create({
        ...b,
        userId: user._id,
        productId: id,
        name: user.name,
      }),
    );
  }
}

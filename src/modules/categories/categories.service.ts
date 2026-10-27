import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DataSource) {}

  async findAll() {
    return this.db.getRepository(Category).find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const c = await this.db.getRepository(Category).findOneBy({ _id: id });
    if (!c) {
      throw new NotFoundException();
    }
    return c;
  }

  async existsByName(name: string): Promise<boolean> {
    return this.db.getRepository(Category).existsBy({ name });
  }

  async create(b: CategoryDto) {
    const r = this.db.getRepository(Category);
    return r.save(r.create(b));
  }

  async update(id: string, b: CategoryDto) {
    return this.db.transaction(async (m) => {
      const c = await m.findOneBy(Category, { _id: id });
      if (!c) {
        throw new NotFoundException();
      }
      const oldName = c.name;
      Object.assign(c, b);
      await m.save(c);
      if (oldName !== c.name) {
        await m.query(
          'UPDATE coupons SET "applicableCategories" = (SELECT jsonb_agg(CASE WHEN value = to_jsonb($1::text) THEN to_jsonb($2::text) ELSE value END) FROM jsonb_array_elements("applicableCategories")) WHERE "applicableCategories" @> to_jsonb(ARRAY[$1::text])',
          [oldName, c.name],
        );
      }
      return c;
    });
  }

  async remove(id: string) {
    const r = await this.db.getRepository(Category).delete(id);
    if (!r.affected) {
      throw new NotFoundException();
    }
    return { message: 'Đã xóa danh mục' };
  }
}

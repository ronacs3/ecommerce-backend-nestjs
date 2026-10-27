import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: '' })
  brand: string;

  @Index()
  @Column()
  category: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  image: string;

  @Column('jsonb', { default: [] })
  images: string[];

  @Column('double precision')
  price: number;

  @Column('integer', { default: 0 })
  countInStock: number;
}

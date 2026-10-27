import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column('double precision')
  discount: number;

  @Column('timestamptz')
  expirationDate: Date;

  @Column('jsonb', { default: [] })
  applicableCategories: string[];
}

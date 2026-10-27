import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OrderItem } from '../interfaces/order-item.interface';

@Entity('orders')
export class Order extends BaseEntity {
  @Index()
  @Column('uuid')
  userId: string;

  @Column('jsonb')
  orderItems: OrderItem[];

  @Column('jsonb')
  shippingAddress: Record<string, string>;

  @Column()
  paymentMethod: string;

  @Column('double precision')
  itemsPrice: number;

  @Column('double precision')
  shippingPrice: number;

  @Column('double precision')
  taxPrice: number;

  @Column('double precision', { default: 0 })
  discountAmount: number;

  @Column({ nullable: true })
  couponCode: string;

  @Column('double precision')
  totalPrice: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ default: false })
  isDelivered: boolean;

  @Column({ default: false })
  isCancelled: boolean;

  @Column('timestamptz', { nullable: true })
  paidAt: Date;

  @Column('timestamptz', { nullable: true })
  deliveredAt: Date;
}

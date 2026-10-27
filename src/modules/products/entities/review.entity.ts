import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('reviews')
@Index(['userId', 'productId'], { unique: true })
export class Review extends BaseEntity {
  @Column('uuid')
  userId: string;

  @Index()
  @Column('uuid')
  productId: string;

  @Column()
  name: string;

  @Column('integer')
  rating: number;

  @Column()
  comment: string;
}

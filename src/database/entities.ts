import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Review } from '../modules/products/entities/review.entity';
import { Coupon } from '../modules/coupons/entities/coupon.entity';
import { Order } from '../modules/orders/entities/order.entity';

export { User, Category, Product, Review, Coupon, Order };
export type { OrderItem } from '../modules/orders/interfaces/order-item.interface';

export const entities = [User, Category, Product, Coupon, Order, Review];

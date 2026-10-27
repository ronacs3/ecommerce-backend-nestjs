import { MigrationInterface, QueryRunner } from 'typeorm';
export class InitialSchema1730000000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    const base = '"_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()';
    await q.query(`CREATE TABLE users (${base}, name varchar NOT NULL, email varchar NOT NULL UNIQUE, password varchar NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false)`);
    await q.query(`CREATE TABLE categories (${base}, name varchar NOT NULL UNIQUE, description varchar NOT NULL DEFAULT '')`);
    await q.query(`CREATE TABLE products (${base}, name varchar NOT NULL, brand varchar NOT NULL DEFAULT '', category varchar NOT NULL REFERENCES categories(name) ON UPDATE CASCADE ON DELETE RESTRICT, description varchar NOT NULL DEFAULT '', image varchar NOT NULL DEFAULT '', images jsonb NOT NULL DEFAULT '[]', price double precision NOT NULL CHECK(price >= 0), "countInStock" integer NOT NULL DEFAULT 0 CHECK("countInStock" >= 0))`);
    await q.query(`CREATE TABLE coupons (${base}, code varchar NOT NULL UNIQUE, discount double precision NOT NULL CHECK(discount > 0 AND discount <= 100), "expirationDate" timestamptz NOT NULL, "applicableCategories" jsonb NOT NULL DEFAULT '[]')`);
    await q.query(`CREATE TABLE orders (${base}, "userId" uuid NOT NULL REFERENCES users("_id") ON DELETE RESTRICT, "orderItems" jsonb NOT NULL, "shippingAddress" jsonb NOT NULL, "paymentMethod" varchar NOT NULL, "itemsPrice" double precision NOT NULL, "shippingPrice" double precision NOT NULL, "taxPrice" double precision NOT NULL, "discountAmount" double precision NOT NULL DEFAULT 0, "couponCode" varchar, "totalPrice" double precision NOT NULL CHECK("totalPrice" >= 0), "isPaid" boolean NOT NULL DEFAULT false, "isDelivered" boolean NOT NULL DEFAULT false, "isCancelled" boolean NOT NULL DEFAULT false, "paidAt" timestamptz, "deliveredAt" timestamptz)`);
    await q.query(`CREATE TABLE reviews (${base}, "userId" uuid NOT NULL REFERENCES users("_id") ON DELETE CASCADE, "productId" uuid NOT NULL REFERENCES products("_id") ON DELETE CASCADE, name varchar NOT NULL, rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5), comment varchar NOT NULL, UNIQUE("userId", "productId"))`);
    for (const [table, field] of [['products', 'category'], ['orders', 'userId'], ['reviews', 'productId']]) await q.query(`CREATE INDEX ON "${table}" ("${field}")`);
  }
  async down(q: QueryRunner): Promise<void> { for (const t of ['reviews', 'orders', 'coupons', 'products', 'categories', 'users']) await q.query(`DROP TABLE "${t}"`); }
}

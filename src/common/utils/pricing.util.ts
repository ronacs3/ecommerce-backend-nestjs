import type { OrderItem } from '../../modules/orders/interfaces/order-item.interface';

export function totals(items: OrderItem[], discount = 0, categories: string[] = []) {
  const round = (n: number) => Math.round(n * 100) / 100;
  const itemsPrice = round(items.reduce((s, i) => s + i.price * i.qty, 0));
  const shippingPrice = itemsPrice > 10000000 ? 0 : 30000;
  const taxPrice = Math.round(itemsPrice * 0.1);
  const discountAmount = round(
    items
      .filter((i) => !categories.length || categories.includes(i.category))
      .reduce((s, i) => s + (i.price * i.qty * discount) / 100, 0),
  );
  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    totalPrice: round(itemsPrice + shippingPrice + taxPrice - discountAmount),
  };
}

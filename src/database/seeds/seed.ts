import 'dotenv/config';
import { hash } from 'bcryptjs';
import { database } from '../data-source';
import { User, Category, Product } from '../entities';

export async function runSeed() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12 || password.startsWith('replace-')) {
    throw new Error('Set ADMIN_EMAIL and a strong ADMIN_PASSWORD (12+ characters)');
  }
  await database.initialize();
  try {
    await database.transaction(async (m) => {
      if (!(await m.existsBy(User, { email }))) {
        await m.save(
          User,
          m.create(User, {
            name: 'Administrator',
            email,
            password: await hash(password, 12),
            isAdmin: true,
          }),
        );
      }
      if (!(await m.existsBy(Category, { name: 'Điện tử' }))) {
        await m.save(
          Category,
          m.create(Category, { name: 'Điện tử', description: 'Thiết bị điện tử' }),
        );
      }
      if (!(await m.existsBy(Product, { name: 'Tai nghe mẫu' }))) {
        await m.save(
          Product,
          m.create(Product, {
            name: 'Tai nghe mẫu',
            category: 'Điện tử',
            brand: 'Demo',
            description: 'Sản phẩm mẫu để kiểm tra quy trình mua hàng',
            price: 500000,
            countInStock: 20,
            image: '/images/default-image.jpg',
          }),
        );
      }
    });
    console.log('Seed completed. Existing admin credentials were not changed.');
  } finally {
    await database.destroy();
  }
}

if (require.main === module) {
  runSeed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

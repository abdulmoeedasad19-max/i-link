import 'dotenv/config';
import { db } from './src/lib/db';

async function main() {
  const laptopCategory = await db.category.findUnique({ where: { slug: 'laptops' } });
  if (!laptopCategory) {
    console.error('Laptops category not found!');
    return;
  }

  const collections = [
    { name: 'Programming & Coding Laptops', slug: 'programming' },
    { name: 'Gaming Laptops', slug: 'gaming' },
  ];

  for (const coll of collections) {
    // @ts-ignore
    await db.collection.upsert({
      where: { slug: coll.slug },
      update: { categoryId: laptopCategory.id },
      create: { ...coll, categoryId: laptopCategory.id }
    });
  }
  console.log('Seeded new Laptops collections');
}

main().catch(console.error).finally(() => db.$disconnect());

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const laptopCategory = await db.category.findUnique({ where: { slug: 'laptops' } });
  if (!laptopCategory) {
    console.error('Laptops category not found!');
    return;
  }

  const collections = [
    { name: 'Student Laptops', slug: 'student' },
    { name: 'Office Laptops', slug: 'office' },
    { name: 'Business Laptops', slug: 'business' },
  ];

  for (const coll of collections) {
    await db.collection.upsert({
      where: { slug: coll.slug },
      update: { categoryId: laptopCategory.id },
      create: { ...coll, categoryId: laptopCategory.id }
    });
  }
  console.log('Seeded Laptops collections');
}

main().catch(console.error).finally(() => db.$disconnect());

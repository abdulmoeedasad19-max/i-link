const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const under75k = await prisma.product.findMany({
    where: {
      price: { lte: 75000 },
      categories: { some: { category: { slug: 'laptops' } } }
    },
    select: { name: true, price: true, brand: true, stock: true }
  });
  
  console.log("--- Laptops under 75000 ---");
  console.log(under75k);

  const under150k = await prisma.product.findMany({
    where: {
      price: { lte: 150000, gt: 100000 },
      categories: { some: { category: { slug: 'laptops' } } }
    },
    select: { name: true, price: true, brand: true, stock: true }
  });

  console.log("--- Laptops under 150000 (and >100000) ---");
  console.log(under150k);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());


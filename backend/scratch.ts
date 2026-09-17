import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== CATEGORIES ===");
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } }
  });
  console.log(JSON.stringify(categories, null, 2));

  console.log("\n=== BRANDS ===");
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } }
  });
  console.log(JSON.stringify(brands, null, 2));

  console.log("\n=== LAPTOPS (Guessing category slug 'laptops' or similar) ===");
  const laptopCategory = categories.find(c => c.slug.toLowerCase().includes('laptop'));
  if (laptopCategory) {
    const laptops = await prisma.product.findMany({
      where: { categoryId: laptopCategory.id },
      include: { brand: true, category: true }
    });
    console.log(`Found ${laptops.length} laptops in category ${laptopCategory.slug}`);
    
    const tags = new Set();
    laptops.forEach(l => {
      if (l.tags) {
        l.tags.forEach(t => tags.add(t));
      }
    });
    console.log("Laptop Tags:", Array.from(tags));
  } else {
    console.log("No laptop category found. Checking all products for 'laptop' in name/slug...");
    const laptops = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'laptop', mode: 'insensitive' } },
          { slug: { contains: 'laptop', mode: 'insensitive' } }
        ]
      },
      include: { brand: true, category: true }
    });
    console.log(`Found ${laptops.length} products with 'laptop' in name/slug.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());


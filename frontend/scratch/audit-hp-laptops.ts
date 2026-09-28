import 'dotenv/config';
import { db } from "../src/lib/db";
import * as fs from 'fs';

async function main() {
  const laptopsCategory = await db.category.findUnique({
    where: { slug: 'laptops' }
  });

  if (!laptopsCategory) {
    console.error("Laptops category not found");
    return;
  }

  const hpBrand = await db.brand.findUnique({
    where: { slug: 'hp' }
  });

  if (!hpBrand) {
    console.error("HP brand not found");
    return;
  }

  const activeHpLaptops = await db.product.findMany({
    where: {
      categoryId: laptopsCategory.id,
      brandId: hpBrand.id,
      status: 'ACTIVE'
    },
    include: {
      category: true,
      brand: true,
      collections: {
        include: { collection: true }
      },
      images: true,
    }
  });

  console.log(`Found ${activeHpLaptops.length} active HP laptops.`);
  fs.writeFileSync('scratch/hp-laptops.json', JSON.stringify(activeHpLaptops, null, 2));
}

main().catch(console.error).finally(() => db.$disconnect());


import 'dotenv/config';
import { db } from "../src/lib/db";
import * as fs from 'fs';

async function main() {
  const hpBrand = await db.brand.findUnique({ where: { slug: 'hp' } });
  const laptopsCategory = await db.category.findUnique({ where: { slug: 'laptops' } });

  const currentLaptops = await db.product.findMany({
    where: {
      categoryId: laptopsCategory.id,
      brandId: hpBrand.id,
      status: 'ACTIVE'
    },
    include: {
      collections: { include: { collection: true } },
      images: true,
    }
  });

  fs.writeFileSync('scratch/final-hp-data.json', JSON.stringify(currentLaptops, null, 2));
  console.log(`Extracted ${currentLaptops.length} HP laptops.`);
}

main().catch(console.error).finally(() => db.$disconnect());


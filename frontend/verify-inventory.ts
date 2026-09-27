import { db } from "./src/lib/db";

async function main() {
  const allProducts = await db.product.findMany({
    select: { name: true, price: true, brand: true, stock: true }
  });

  const laptops = allProducts.filter(p => p.name.toLowerCase().includes('laptop') || p.name.toLowerCase().includes('thinkpad') || p.name.toLowerCase().includes('elitebook') || p.name.toLowerCase().includes('latitude') || p.name.toLowerCase().includes('macbook'));

  const under75k = laptops.filter(l => l.price <= 75000);
  const under150k = laptops.filter(l => l.price > 100000 && l.price <= 150000);

  console.log("--- Laptops Under 75k ---");
  under75k.forEach(l => console.log(`${l.price} | ${l.name}`));

  console.log("\n--- Laptops 100k to 150k ---");
  under150k.forEach(l => console.log(`${l.price} | ${l.name}`));
}

main().catch(console.error).finally(() => db.$disconnect());


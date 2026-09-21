const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const res = await client.query(`
    SELECT price FROM "Product" p
    JOIN "Category" c ON p."categoryId" = c.id
    WHERE c.slug = 'laptops' AND p.status = 'ACTIVE'
  `);
  
  const prices = res.rows.map(r => parseFloat(r.price));
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const count50 = prices.filter(p => p <= 50000).length;
  const count75 = prices.filter(p => p <= 75000).length;
  const count100 = prices.filter(p => p <= 100000).length;
  const count150 = prices.filter(p => p <= 150000).length;
  
  console.log(`Active laptop count: ${prices.length}`);
  console.log(`Min price: ${min}`);
  console.log(`Max price: ${max}`);
  console.log(`<= 50,000 count: ${count50}`);
  console.log(`<= 75,000 count: ${count75}`);
  console.log(`<= 100,000 count: ${count100}`);
  console.log(`<= 150,000 count: ${count150}`);
  
  await client.end();
}
main().catch(console.error);
